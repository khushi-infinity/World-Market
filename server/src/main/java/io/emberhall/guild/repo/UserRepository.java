package io.emberhall.guild.repo;

import io.emberhall.guild.domain.Enums;
import io.emberhall.guild.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByHandleIgnoreCase(String handle);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByHandleIgnoreCase(String handle);

    List<User> findByRole(Enums.Role role);

    long countByRole(Enums.Role role);

    @Query("""
            select u from User u
            where u.role = :role
              and (:q is null or lower(u.name) like lower(concat('%', :q, '%'))
                   or lower(u.handle) like lower(concat('%', :q, '%'))
                   or lower(coalesce(u.skills, '')) like lower(concat('%', :q, '%'))
                   or lower(coalesce(u.title, '')) like lower(concat('%', :q, '%')))
              and (:region is null or u.region = :region)
            """)
    Page<User> searchArtisans(@Param("role") Enums.Role role,
                              @Param("q") String q,
                              @Param("region") String region,
                              Pageable pageable);

    @Query("select coalesce(avg(u.rating), 0) from User u where u.role = :role")
    double averageRatingForRole(@Param("role") Enums.Role role);
}
