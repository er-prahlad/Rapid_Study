package com.rapidstudy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * UserQuestionProgress entity tracking user progress on individual questions
 */
@Entity
@Table(name = "user_question_progress", indexes = {
    @Index(name = "idx_user_question_progress_user_id", columnList = "userId"),
    @Index(name = "idx_user_question_progress_question_id", columnList = "questionId"),
    @Index(name = "idx_user_question_progress_last_attempted", columnList = "lastAttemptedAt")
}, uniqueConstraints = {
    @UniqueConstraint(name = "unique_user_question_progress", columnNames = {"userId", "questionId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount = 0;

    @Column(name = "wrong_count", nullable = false)
    private Integer wrongCount = 0;

    @Column(name = "last_attempted_at")
    private LocalDateTime lastAttemptedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private Question question;
}
