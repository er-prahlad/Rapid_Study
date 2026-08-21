package com.rapidstudy.repository;

import com.rapidstudy.entity.MockTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for MockTest entity
 */
@Repository
public interface MockTestRepository extends JpaRepository<MockTest, Long> {
    
    Page<MockTest> findByExamIdAndIsPublishedTrue(Long examId, Pageable pageable);
    
    Page<MockTest> findByIsPublishedTrue(Pageable pageable);
}
