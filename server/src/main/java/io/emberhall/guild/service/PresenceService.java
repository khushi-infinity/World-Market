package io.emberhall.guild.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    private static final Logger log = LoggerFactory.getLogger(PresenceService.class);
    private static final String KEY = "emberhall:presence";
    private static final Duration WINDOW = Duration.ofSeconds(75);

    private final StringRedisTemplate redis;
    private final boolean redisEnabled;
    private final Map<Long, Instant> memory = new ConcurrentHashMap<>();

    public PresenceService(StringRedisTemplate redis,
                           @Value("${app.redis.enabled:false}") boolean redisEnabled) {
        this.redis = redis;
        this.redisEnabled = redisEnabled;
    }

    public void ping(Long userId) {
        memory.put(userId, Instant.now());
        if (redisEnabled) {
            try {
                long now = Instant.now().toEpochMilli();
                redis.opsForZSet().add(KEY, String.valueOf(userId), now);
                redis.opsForZSet().removeRangeByScore(KEY, 0, now - WINDOW.toMillis());
            } catch (Exception ex) {
                log.debug("Redis presence unavailable, using memory: {}", ex.getMessage());
            }
        }
    }

    public Set<Long> onlineIds() {
        if (redisEnabled) {
            try {
                long cutoff = Instant.now().toEpochMilli() - WINDOW.toMillis();
                Set<String> raw = redis.opsForZSet().rangeByScore(KEY, cutoff, Double.MAX_VALUE);
                if (raw != null) {
                    return raw.stream().map(Long::valueOf).collect(Collectors.toSet());
                }
            } catch (Exception ex) {
                log.debug("Redis presence read failed, using memory: {}", ex.getMessage());
            }
        }
        Instant cutoff = Instant.now().minus(WINDOW);
        memory.entrySet().removeIf(e -> e.getValue().isBefore(cutoff));
        return memory.keySet();
    }

    public boolean isOnline(Long userId) {
        return onlineIds().contains(userId);
    }

    public List<Long> snapshot() {
        return onlineIds().stream().sorted().toList();
    }
}
