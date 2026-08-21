package com.rapidstudy.entity;

import com.rapidstudy.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TestAttempt entity representing user test attempts
 */
@Entity
@Table(name = "test_attempts", indexes = {
    @Index(name = "idx_test_attempts_user_id", columnList = "user_id"),
    @Index(name = "idx_test_attempts_mock_test_id", columnList = "mock_test_id"),
    @Index(name = "idx_test_attempts_status", columnList = "status"),
    @Index(name = "idx_test_attempts_submitted_at", columnList = "submitted_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mock_test_id", nullable = false)
    private Long mockTestId;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(precision = 8, scale = 2)
    private BigDecimal score;

    @Column(name = "total_marks", precision = 8, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers = 0;

    @Column(name = "wrong_answers", nullable = false)
    private Integer wrongAnswers = 0;

    @Column(nullable = false)
    private Integer unanswered = 0;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_id", insertable = false, updatable = false)
    private MockTest mockTest;
}
