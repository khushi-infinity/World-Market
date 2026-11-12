package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByJobIdOrderByCreatedAtDesc(Long jobId);

    List<Proposal> findByArtisanIdOrderByCreatedAtDesc(Long artisanId);

    Optional<Proposal> findByJobIdAndArtisanId(Long jobId, Long artisanId);

    long countByArtisanId(Long artisanId);

    long countByArtisanIdAndStatus(Long artisanId, Enums.ProposalStatus status);
}
