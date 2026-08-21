package com.rapidstudy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MockTestQuestion entity mapping questions to mock tests
 */
@Entity
@Table(name = "mock_test_questions", indexes = {
    @Index(name = "idx_mock_test_questions_test_id", columnList = "mock_test_id"),
    @Index(name = "idx_mock_test_questions_question_id", columnList = "question_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "unique_test_question", columnNames = {"mock_test_id", "question_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mock_test_id", nullable = false)
    private Long mockTestId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_test_id", insertable = false, updatable = false)
    private MockTest mockTest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", insertable = false, updatable = false)
    private Question question;
}
