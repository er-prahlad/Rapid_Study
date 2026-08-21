package com.rapidstudy.repository;

import com.rapidstudy.entity.Question;
import com.rapidstudy.enums.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Question entity
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    Page<Question> findByTopicIdAndIsActiveTrue(Long topicId, Pageable pageable);
    
    Page<Question> findByTopicIdAndDifficultyAndIsActiveTrue(Long topicId, Difficulty difficulty, Pageable pageable);
    
    List<Question> findByIdInAndIsActiveTrue(List<Long> ids);
    
    long countByTopicIdAndIsActiveTrue(Long topicId);
}
