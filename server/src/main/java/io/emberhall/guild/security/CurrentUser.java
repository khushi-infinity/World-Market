package io.emberhall.guild.security;

import io.emberhall.guild.domain.User;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.web.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CurrentUser {

    private final UserRepository users;

    public CurrentUser(UserRepository users) {
        this.users = users;
    }

    public Optional<User> optional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long id)) {
            return Optional.empty();
        }
        return users.findById(id);
    }

    public User require() {
        return optional().orElseThrow(() -> ApiException.unauthorized("Sign in to enter the hall."));
    }

    public Long idOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long id)) {
            return null;
        }
        return id;
    }
}
