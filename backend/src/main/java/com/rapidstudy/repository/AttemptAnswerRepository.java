package com.rapidstudy.repository;

import com.rapidstudy.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

    List<AttemptAnswer> findByAttemptId(Long attemptId);

    Optional<AttemptAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);

    long countByAttemptIdAndMarkedForReviewTrue(Long attemptId);

    long countByAttemptIdAndSelectedOptionIdIsNotNull(Long attemptId);

    @Modifying
    @Query("DELETE FROM AttemptAnswer a WHERE a.attemptId = :attemptId AND a.questionId = :questionId")
    void deleteByAttemptIdAndQuestionId(@Param("attemptId") Long attemptId,
                                        @Param("questionId") Long questionId);
}
