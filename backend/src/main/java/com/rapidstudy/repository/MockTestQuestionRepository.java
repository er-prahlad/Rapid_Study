package com.rapidstudy.repository;

import com.rapidstudy.entity.MockTestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for MockTestQuestion entity
 */
@Repository
public interface MockTestQuestionRepository extends JpaRepository<MockTestQuestion, Long> {
    
    List<MockTestQuestion> findByMockTestIdOrderByQuestionOrderAsc(Long mockTestId);
    
    long countByMockTestId(Long mockTestId);
    
    boolean existsByMockTestIdAndQuestionId(Long mockTestId, Long questionId);
}
