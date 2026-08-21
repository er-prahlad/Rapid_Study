package com.rapidstudy.repository;

import com.rapidstudy.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Exam entity
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    Optional<Exam> findByCode(String code);
    
    List<Exam> findByIsActiveTrue();
    
    boolean existsByCode(String code);
}
