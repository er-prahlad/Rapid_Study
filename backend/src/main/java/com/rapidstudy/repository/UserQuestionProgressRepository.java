package com.rapidstudy.repository;

import com.rapidstudy.entity.UserQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for UserQuestionProgress entity
 */
@Repository
public interface UserQuestionProgressRepository extends JpaRepository<UserQuestionProgress, Long> {
    
    Optional<UserQuestionProgress> findByUserIdAndQuestionId(Long userId, Long questionId);
}
