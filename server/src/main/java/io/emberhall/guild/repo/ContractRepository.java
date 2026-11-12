package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Contract;
import io.emberhall.guild.domain.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query("select c from Contract c where c.patron.id = :userId or c.artisan.id = :userId order by c.createdAt desc")
    List<Contract> findForUser(Long userId);

    List<Contract> findByPatronIdOrderByCreatedAtDesc(Long patronId);

    List<Contract> findByArtisanIdOrderByCreatedAtDesc(Long artisanId);

    Optional<Contract> findByJobId(Long jobId);

    boolean existsByReference(String reference);

    long countByStatus(Enums.ContractStatus status);

    @Query(value = "select coalesce(sum(total), 0) from contracts where status in ('FUNDED','IN_PROGRESS','DELIVERED','DISPUTED')", nativeQuery = true)
    BigDecimal sumHeldInVault();

    @Query(value = "select coalesce(sum(amount), 0) from contracts where status = 'RELEASED'", nativeQuery = true)
    BigDecimal sumReleased();
}
