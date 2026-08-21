package com.rapidstudy.repository;

import com.rapidstudy.entity.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for StudyPlan entity
 */
@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    
    List<StudyPlan> findByUserIdAndIsActiveTrue(Long userId);
    
    List<StudyPlan> findByUserId(Long userId);
}
