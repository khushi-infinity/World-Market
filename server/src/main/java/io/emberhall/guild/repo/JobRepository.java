package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
            select j from Job j
            where (:q is null or lower(j.title) like lower(concat('%', :q, '%'))
                   or lower(j.description) like lower(concat('%', :q, '%'))
                   or lower(coalesce(j.skills, '')) like lower(concat('%', :q, '%')))
              and (:region is null or j.region = :region)
              and (:type is null or j.budgetType = :type)
              and (:min is null or j.budgetMax >= :min)
              and (:status is null or j.status = :status)
            """)
    Page<Job> search(@Param("q") String q,
                     @Param("region") String region,
                     @Param("type") String type,
                     @Param("min") BigDecimal min,
                     @Param("status") Enums.JobStatus status,
                     Pageable pageable);

    List<Job> findTop6ByStatusOrderByCreatedAtDesc(Enums.JobStatus status);

    List<Job> findTop4ByFeaturedTrueOrderByCreatedAtDesc();

    List<Job> findByPatronIdOrderByCreatedAtDesc(Long patronId);

    long countByStatus(Enums.JobStatus status);

    long countByRegion(String region);
}
