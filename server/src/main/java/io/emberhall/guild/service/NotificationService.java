package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Notification;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.NotificationResponse;
import io.emberhall.guild.repo.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;
    private final Mapper mapper;
    private final SimpMessagingTemplate messaging;

    public NotificationService(NotificationRepository repo, Mapper mapper, SimpMessagingTemplate messaging) {
        this.repo = repo;
        this.mapper = mapper;
        this.messaging = messaging;
    }

    @Transactional
    public void notify(User user, String title, String body, Enums.NotificationType type, String link) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setType(type);
        n.setLink(link);
        repo.save(n);
        messaging.convertAndSend("/topic/users/" + user.getId() + "/notifications", mapper.notification(n));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        return repo.findTop30ByUserIdOrderByCreatedAtDesc(userId).stream().map(mapper::notification).toList();
    }

    @Transactional(readOnly = true)
    public long unread(Long userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> items = repo.findTop30ByUserIdOrderByCreatedAtDesc(userId);
        items.forEach(n -> n.setRead(true));
        repo.saveAll(items);
    }
}
