package io.emberhall.guild.service;

import io.emberhall.guild.domain.Conversation;
import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Message;
import io.emberhall.guild.domain.User;
import io.emberhall.guild.dto.Dtos.*;
import io.emberhall.guild.repo.ConversationRepository;
import io.emberhall.guild.repo.MessageRepository;
import io.emberhall.guild.repo.UserRepository;
import io.emberhall.guild.security.CurrentUser;
import io.emberhall.guild.web.ApiException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final UserRepository users;
    private final CurrentUser currentUser;
    private final Mapper mapper;
    private final SimpMessagingTemplate messaging;
    private final NotificationService notifications;

    public ChatService(ConversationRepository conversations, MessageRepository messages,
                       UserRepository users, CurrentUser currentUser, Mapper mapper,
                       SimpMessagingTemplate messaging, NotificationService notifications) {
        this.conversations = conversations;
        this.messages = messages;
        this.users = users;
        this.currentUser = currentUser;
        this.mapper = mapper;
        this.messaging = messaging;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> list() {
        User me = currentUser.require();
        return conversations.findForUser(me.getId()).stream()
                .map(c -> {
                    List<Message> all = messages.findByConversationIdOrderByCreatedAtAsc(c.getId());
                    String last = all.isEmpty() ? "No ravens yet." : all.get(all.size() - 1).getBody();
                    return mapper.conversation(c, me.getId(), last, all.size());
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse get(Long id) {
        User me = currentUser.require();
        Conversation c = requireParticipant(id, me);
        List<Message> all = messages.findByConversationIdOrderByCreatedAtAsc(c.getId());
        String last = all.isEmpty() ? "No ravens yet." : all.get(all.size() - 1).getBody();
        return mapper.conversation(c, me.getId(), last, all.size());
    }

    @Transactional
    public ConversationResponse start(Long otherUserId, String subject) {
        User me = currentUser.require();
        if (otherUserId == null || otherUserId.equals(me.getId())) {
            throw ApiException.badRequest("A raven needs another member to carry it.");
        }
        User other = users.findById(otherUserId)
                .orElseThrow(() -> ApiException.notFound("No such member of the guild."));

        User patron = me.getRole() == Enums.Role.ARTISAN ? other : me;
        User artisan = me.getRole() == Enums.Role.ARTISAN ? me : other;

        var existing = conversations.findFirstByPatronIdAndArtisanIdOrderByLastMessageAtDesc(
                patron.getId(), artisan.getId());
        if (existing.isPresent()) {
            Conversation c = existing.get();
            List<Message> all = messages.findByConversationIdOrderByCreatedAtAsc(c.getId());
            String last = all.isEmpty() ? "No ravens yet." : all.get(all.size() - 1).getBody();
            return mapper.conversation(c, me.getId(), last, all.size());
        }

        Conversation c = new Conversation();
        c.setPatron(patron);
        c.setArtisan(artisan);
        c.setSubject(subject == null || subject.isBlank() ? "A raven from " + me.getName() : subject.trim());
        c.setCreatedAt(Instant.now());
        c.setLastMessageAt(Instant.now());
        conversations.save(c);
        systemMessage(c, "A raven thread is opened between " + patron.getName() + " and " + artisan.getName() + ".");

        notifications.notify(other, "A raven arrives", me.getName() + " has opened a thread with you.",
                Enums.NotificationType.MESSAGE, "/messages?c=" + c.getId());
        List<Message> all = messages.findByConversationIdOrderByCreatedAtAsc(c.getId());
        String last = all.isEmpty() ? "No ravens yet." : all.get(all.size() - 1).getBody();
        return mapper.conversation(c, me.getId(), last, all.size());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> history(Long conversationId) {
        User me = currentUser.require();
        requireParticipant(conversationId, me);
        return messages.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(mapper::message)
                .toList();
    }

    @Transactional
    public MessageResponse send(Long conversationId, String body) {
        User me = currentUser.require();
        Conversation c = requireParticipant(conversationId, me);
        Message m = new Message();
        m.setConversation(c);
        m.setSender(me);
        m.setBody(body.trim());
        m.setCreatedAt(Instant.now());
        messages.save(m);
        c.setLastMessageAt(m.getCreatedAt());
        conversations.save(c);

        MessageResponse dto = mapper.message(m);
        messaging.convertAndSend("/topic/conversations/" + conversationId, dto);

        User other = c.getPatron().getId().equals(me.getId()) ? c.getArtisan() : c.getPatron();
        notifications.notify(other, "A raven from " + me.getName(),
                body.length() > 90 ? body.substring(0, 90) + "..." : body,
                Enums.NotificationType.MESSAGE, "/messages?c=" + conversationId);
        return dto;
    }

    @Transactional
    public MessageResponse systemMessage(Conversation c, String body) {
        Message m = new Message();
        m.setConversation(c);
        m.setSender(c.getPatron());
        m.setBody(body);
        m.setSystem(true);
        m.setCreatedAt(Instant.now());
        messages.save(m);
        c.setLastMessageAt(m.getCreatedAt());
        conversations.save(c);
        MessageResponse dto = mapper.message(m);
        messaging.convertAndSend("/topic/conversations/" + c.getId(), dto);
        return dto;
    }

    public Conversation requireParticipant(Long id, User me) {
        Conversation c = conversations.findById(id)
                .orElseThrow(() -> ApiException.notFound("That raven thread does not exist."));
        if (!c.getPatron().getId().equals(me.getId()) && !c.getArtisan().getId().equals(me.getId())) {
            throw ApiException.forbidden("This thread belongs to another pair of hands.");
        }
        return c;
    }
}
