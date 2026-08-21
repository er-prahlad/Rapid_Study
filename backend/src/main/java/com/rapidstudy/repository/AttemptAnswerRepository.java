package com.rapidstudy.repository;

import com.rapidstudy.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for AttemptAnswer entity
 */
@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    
    List<AttemptAnswer> findByAttemptId(Long attemptId);
    
    Optional<AttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    
    long countByAttemptIdAndMarkedForReviewTrue(Long attemptId);
    
    long countByAttemptIdAndSelectedOptionIdIsNotNull(Long attemptId);
}
