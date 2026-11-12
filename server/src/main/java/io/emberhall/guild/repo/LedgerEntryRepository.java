package io.emberhall.guild.repo;

import io.emberhall.guild.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);

    List<LedgerEntry> findTop50ByOrderByCreatedAtDesc();
}
