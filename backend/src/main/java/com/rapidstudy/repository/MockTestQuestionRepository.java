package com.rapidstudy.repository;

import com.rapidstudy.entity.MockTestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockTestQuestionRepository extends JpaRepository<MockTestQuestion, Long> {

    List<MockTestQuestion> findByMockTestIdOrderByQuestionOrderAsc(Long mockTestId);

    long countByMockTestId(Long mockTestId);

    boolean existsByMockTestIdAndQuestionId(Long mockTestId, Long questionId);

    @Modifying
    @Query("DELETE FROM MockTestQuestion q WHERE q.mockTestId = :testId")
    void deleteByMockTestId(@Param("testId") Long mockTestId);
}
