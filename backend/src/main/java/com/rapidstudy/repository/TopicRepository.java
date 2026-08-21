package com.rapidstudy.repository;

import com.rapidstudy.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Topic entity
 */
@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    List<Topic> findBySubjectIdOrderByDisplayOrderAsc(Long subjectId);
}
