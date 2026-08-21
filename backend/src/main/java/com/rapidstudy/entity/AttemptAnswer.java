package com.rapidstudy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AttemptAnswer entity representing individual answers within a test attempt
 */
@Entity
@Table(name = "attempt_answers", indexes = {
    @Index(name = "idx_attempt_answers_attempt_id", columnList = "attemptId"),
    @Index(name = "idx_attempt_answers_question_id", columnList = "questionId"),
    @Index(name = "idx_attempt_answers_marked_for_review", columnList = "markedForReview")
}, uniqueConstraints = {
    @UniqueConstraint(name = "unique_attempt_question", columnNames = {"attemptId", "questionId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "selected_option_id")
    private Long selectedOptionId;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_obtained", precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "marked_for_review", nullable = false)
    private Boolean markedForReview = false;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", insertable = false, updatable = false)
    private TestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id", insertable = false, updatable = false)
    private Option selectedOption;
}
