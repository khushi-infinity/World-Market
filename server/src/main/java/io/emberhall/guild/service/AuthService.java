package io.emberhall.guild.service;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.security.JwtService;
import io.emberhall.guild.web.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AuthService {

    private static final List<String> SIGIL_COLORS = List.of(
            "#c9a227", "#8c1c1c", "#5d6b4a", "#b0602c", "#6b5b8e", "#2f6b6b", "#a33b3b", "#8a6d3b");

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final Mapper mapper;
    private final CurrentUser currentUser;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt,
                       Mapper mapper, CurrentUser currentUser) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.mapper = mapper;
        this.currentUser = currentUser;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("That raven address is already sworn to the guild.");
        }
        Enums.Role role = "ARTISAN".equalsIgnoreCase(req.role()) ? Enums.Role.ARTISAN : Enums.Role.PATRON;

        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(role);
        user.setTitle(req.title() == null || req.title().isBlank()
                ? (role == Enums.Role.ARTISAN ? "Journeyman of the Guild" : "Patron of the Hall")
                : req.title().trim());
        user.setRegion(req.region() == null || req.region().isBlank() ? "The Emberhold" : req.region());
        user.setHandle(uniqueHandle(req.handle(), req.name()));
        user.setAvatarColor(SIGIL_COLORS.get(Math.floorMod(user.getHandle().hashCode(), SIGIL_COLORS.size())));
        user.setLocation("The Seven Realms");
        user.setHourlyRate(BigDecimal.ZERO);
        user.setBalance(BigDecimal.ZERO);
        user.setJoinedAt(Instant.now());
        user.setVerified(false);
        user.setSkills(role == Enums.Role.ARTISAN ? "Craft, Counsel" : "");
        user.setBio(role == Enums.Role.ARTISAN
                ? "A new artisan of the hall. Their chronicle is yet unwritten."
                : "A patron of the hall, seeking worthy hands for worthy work.");
        users.save(user);
        return new AuthResponse(jwt.generate(user), mapper.user(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> ApiException.unauthorized("No account is sworn to that raven address."));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("The password does not match the seal on record.");
        }
        user.setLastSeenAt(Instant.now());
        users.save(user);
        return new AuthResponse(jwt.generate(user), mapper.user(user));
    }

    @Transactional(readOnly = true)
    public UserSummary me() {
        return mapper.user(currentUser.require());
    }

    @Transactional
    public UserSummary updateProfile(UpdateProfileRequest req) {
        User user = currentUser.require();
        if (req.name() != null && !req.name().isBlank()) {
            user.setName(req.name().trim());
        }
        if (req.title() != null) {
            user.setTitle(req.title().trim());
        }
        if (req.bio() != null) {
            user.setBio(req.bio().trim());
        }
        if (req.region() != null && !req.region().isBlank()) {
            user.setRegion(req.region());
        }
        if (req.skills() != null) {
            user.setSkills(req.skills().trim());
        }
        if (req.hourlyRate() != null && req.hourlyRate().compareTo(BigDecimal.ZERO) >= 0) {
            user.setHourlyRate(req.hourlyRate());
        }
        if (req.location() != null) {
            user.setLocation(req.location().trim());
        }
        return mapper.user(users.save(user));
    }

    private String uniqueHandle(String requested, String name) {
        String base = (requested == null || requested.isBlank() ? name : requested)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "")
                .trim();
        if (base.isBlank()) {
            base = "wanderer";
        }
        if (base.length() > 24) {
            base = base.substring(0, 24);
        }
        String candidate = base;
        int tries = 0;
        while (users.existsByHandleIgnoreCase(candidate)) {
            candidate = base + ThreadLocalRandom.current().nextInt(10, 999);
            if (++tries > 20) {
                candidate = base + System.currentTimeMillis() % 10000;
                break;
            }
        }
        return candidate;
    }
}
