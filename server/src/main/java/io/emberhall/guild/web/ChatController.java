package io.emberhall.guild.web;

import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.service.ChatService;
import io.emberhall.guild.service.PresenceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chat;
    private final PresenceService presence;

    public ChatController(ChatService chat, PresenceService presence) {
        this.chat = chat;
        this.presence = presence;
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> list() {
        return chat.list();
    }

    @GetMapping("/conversations/{id}")
    public ConversationResponse get(@PathVariable Long id) {
        return chat.get(id);
    }

    @PostMapping("/conversations")
    public ConversationResponse start(@Valid @RequestBody StartConversationRequest req) {
        return chat.start(req.userId(), req.subject());
    }

    @GetMapping("/conversations/{id}/messages")
    public List<MessageResponse> messages(@PathVariable Long id) {
        return chat.history(id);
    }

    @PostMapping("/conversations/{id}/messages")
    public MessageResponse send(@PathVariable Long id, @Valid @RequestBody MessageRequest req) {
        return chat.send(id, req.body());
    }

    @PostMapping("/presence/ping")
    public Map<String, Object> ping(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        if (userId != null) {
            presence.ping(userId);
        }
        return Map.of("ok", true, "online", presence.onlineIds().size());
    }

    @GetMapping("/presence/online")
    public Map<String, Object> online() {
        return Map.of("ids", presence.onlineIds(), "count", presence.onlineIds().size());
    }
}
