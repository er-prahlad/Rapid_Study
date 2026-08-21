package com.rapidstudy.repository;

import com.rapidstudy.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Option entity
 */
@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    
    List<Option> findByQuestionIdOrderByOptionOrderAsc(Long questionId);
    
    List<Option> findByQuestionIdAndIsCorrectTrue(Long questionId);
}
