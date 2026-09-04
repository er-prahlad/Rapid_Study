package com.rapidstudy.repository;

import com.rapidstudy.entity.Question;
import com.rapidstudy.enums.Difficulty;
import org.springframework.data.domain.Page;import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuestionTextAndTopicId(String questionText, Long topicId);

    List<Question> findByIdInAndIsActiveTrue(List<Long> ids);

    long countByTopicIdAndIsActiveTrue(Long topicId);

    /**
     * Filtered, paginated question search for admin and student practice.
     * All filter params are optional (null = no filter).
     */
    @Query("""
        SELECT q FROM Question q
        JOIN q.topic t
        JOIN t.subject s
        WHERE (:topicId IS NULL OR q.topicId = :topicId)
          AND (:subjectId IS NULL OR s.id = :subjectId)
          AND (:difficulty IS NULL OR q.difficulty = :difficulty)
          AND (:isActive IS NULL OR q.isActive = :isActive)
          AND (:search IS NULL OR
               LOWER(q.questionText) LIKE LOWER(CONCAT('%',:search,'%')))
        ORDER BY q.id DESC
        """)
    Page<Question> findFiltered(
            @Param("topicId")    Long topicId,
            @Param("subjectId")  Long subjectId,
            @Param("difficulty") Difficulty difficulty,
            @Param("isActive")   Boolean isActive,
            @Param("search")     String search,
            Pageable pageable);

    /** Random questions for a topic/difficulty (for auto mock test builder) */
    @Query("""
        SELECT q FROM Question q
        WHERE q.topicId = :topicId
          AND q.isActive = true
          AND (:difficulty IS NULL OR q.difficulty = :difficulty)
        ORDER BY FUNCTION('RAND')
        """)
    List<Question> findRandomByTopicAndDifficulty(
            @Param("topicId")    Long topicId,
            @Param("difficulty") Difficulty difficulty,
            Pageable pageable);

    /** Questions the student has previously got wrong (for weak-area practice) */
    @Query("""
        SELECT DISTINCT q FROM Question q
        JOIN AttemptAnswer aa ON aa.questionId = q.id
        JOIN TestAttempt a ON a.id = aa.attemptId
        WHERE a.userId = :userId
          AND aa.isCorrect = false
          AND q.isActive = true
        ORDER BY q.id DESC
        """)
    Page<Question> findWrongQuestionsByUser(@Param("userId") Long userId, Pageable pageable);
}
