package com.rapidstudy.repository;

import com.rapidstudy.entity.TestAttempt;
import com.rapidstudy.enums.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TestAttempt entity
 */
@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    
    Page<TestAttempt> findByUserId(Long userId, Pageable pageable);
    
    Page<TestAttempt> findByUserIdAndStatus(Long userId, AttemptStatus status, Pageable pageable);
    
    Optional<TestAttempt> findByIdAndUserId(Long id, Long userId);
    
    List<TestAttempt> findByMockTestId(Long mockTestId);
    
    long countByUserIdAndStatus(Long userId, AttemptStatus status);
}
