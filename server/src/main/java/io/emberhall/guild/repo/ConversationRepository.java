package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("select c from Conversation c where c.patron.id = :userId or c.artisan.id = :userId order by c.lastMessageAt desc")
    List<Conversation> findForUser(Long userId);

    Optional<Conversation> findByContractId(Long contractId);

    Optional<Conversation> findFirstByPatronIdAndArtisanIdOrderByLastMessageAtDesc(Long patronId, Long artisanId);
}
