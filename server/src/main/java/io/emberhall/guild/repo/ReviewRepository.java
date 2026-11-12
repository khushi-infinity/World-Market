package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByArtisanIdOrderByCreatedAtDesc(Long artisanId);

    boolean existsByContractId(Long contractId);

    long countByArtisanId(Long artisanId);
}
