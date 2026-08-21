package com.rapidstudy.entity;

import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Question entity representing questions in the question bank
 */
@Entity
@Table(name = "questions", indexes = {
    @Index(name = "idx_questions_topic_id", columnList = "topic_id"),
    @Index(name = "idx_questions_difficulty", columnList = "difficulty"),
    @Index(name = "idx_questions_is_active", columnList = "is_active"),
    @Index(name = "idx_questions_question_type", columnList = "question_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "question_text_hindi", columnDefinition = "TEXT")
    private String questionTextHindi;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType = QuestionType.MCQ;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "explanation_hindi", columnDefinition = "TEXT")
    private String explanationHindi;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks = BigDecimal.ONE;

    @Column(name = "negative_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", insertable = false, updatable = false)
    private Topic topic;
}
