package com.rapidstudy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MockTest entity representing mock test configurations
 */
@Entity
@Table(name = "mock_tests", indexes = {
    @Index(name = "idx_mock_tests_exam_id", columnList = "exam_id"),
    @Index(name = "idx_mock_tests_is_published", columnList = "is_published")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "total_marks", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "negative_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal negativeMarks = BigDecimal.ZERO;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    /** MOCK_TEST or PREVIOUS_YEAR — reuses the same test engine (Phase 35) */
    @Column(name = "paper_type", nullable = false, length = 20)
    private String paperType = "MOCK_TEST";

    /** Year of paper, e.g. 2023 — only for PREVIOUS_YEAR type */
    @Column(name = "paper_year")
    private Integer paperYear;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", insertable = false, updatable = false)
    private Exam exam;
}
