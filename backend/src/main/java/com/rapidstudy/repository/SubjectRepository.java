package com.rapidstudy.repository;

import com.rapidstudy.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Subject entity
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByExamIdOrderByDisplayOrderAsc(Long examId);
}
