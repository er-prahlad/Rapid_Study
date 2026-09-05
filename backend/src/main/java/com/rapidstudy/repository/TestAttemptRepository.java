package com.rapidstudy.repository;

import com.rapidstudy.entity.TestAttempt;
import com.rapidstudy.enums.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Page<TestAttempt> findByUserId(Long userId, Pageable pageable);

    Page<TestAttempt> findByUserIdAndStatus(Long userId, AttemptStatus status, Pageable pageable);

    Optional<TestAttempt> findByIdAndUserId(Long id, Long userId);

    List<TestAttempt> findByMockTestId(Long mockTestId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, AttemptStatus status);

    /** Prevent duplicate in-progress attempts for the same test */
    boolean existsByUserIdAndMockTestIdAndStatus(Long userId, Long mockTestId, AttemptStatus status);

    /** Mini-leaderboard — top users by avg score % */
    @Query("""
        SELECT u.id, u.name,
            AVG(CASE WHEN a.totalMarks > 0 THEN a.score / a.totalMarks * 100 ELSE 0 END),
            AVG(CASE WHEN (a.correctAnswers + a.wrongAnswers + a.unanswered) > 0
                     THEN a.correctAnswers * 100.0 / (a.correctAnswers + a.wrongAnswers + a.unanswered)
                     ELSE 0 END),
            COUNT(a.id)
        FROM TestAttempt a JOIN a.user u
        WHERE a.status = com.rapidstudy.enums.AttemptStatus.COMPLETED
        GROUP BY u.id, u.name ORDER BY 3 DESC
        """)
    List<Object[]> findTopUsersByScore(Pageable pageable);
    @Query("""
        SELECT u.id, u.name,
            AVG(CASE WHEN a.totalMarks > 0 THEN a.score / a.totalMarks * 100 ELSE 0 END),
            AVG(CASE WHEN (a.correctAnswers + a.wrongAnswers + a.unanswered) > 0
                     THEN a.correctAnswers * 100.0 / (a.correctAnswers + a.wrongAnswers + a.unanswered)
                     ELSE 0 END),
            COUNT(a.id)
        FROM TestAttempt a JOIN a.user u
        WHERE a.status = com.rapidstudy.enums.AttemptStatus.COMPLETED
          AND a.submittedAt >= :since
        GROUP BY u.id, u.name ORDER BY 3 DESC
        """)
    List<Object[]> findTopUsersByScoreSince(@Param("since") LocalDateTime since, Pageable pageable);

    // Admin dashboard queries
    long countBySubmittedAtAfter(LocalDateTime since);

    long countBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT t.examId, e.name, COUNT(a.id) as cnt
        FROM TestAttempt a JOIN a.mockTest t JOIN t.exam e
        WHERE a.status = com.rapidstudy.enums.AttemptStatus.COMPLETED
        GROUP BY t.examId, e.name ORDER BY cnt DESC
        """)
    List<Object[]> findPopularExams(Pageable pageable);

    @Query("""
        SELECT AVG(CASE WHEN a.totalMarks > 0 THEN a.score / a.totalMarks * 100 ELSE 0 END)
        FROM TestAttempt a
        WHERE a.status = com.rapidstudy.enums.AttemptStatus.COMPLETED
        """)
    Optional<Double> findAveragePlatformScore();
}
