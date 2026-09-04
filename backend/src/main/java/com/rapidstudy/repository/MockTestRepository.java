package com.rapidstudy.repository;

import com.rapidstudy.entity.MockTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MockTestRepository extends JpaRepository<MockTest, Long> {

    Page<MockTest> findByExamIdAndIsPublishedTrue(Long examId, Pageable pageable);

    Page<MockTest> findByIsPublishedTrue(Pageable pageable);

    /** Admin view: all tests filtered by exam and/or search */
    @Query("""
        SELECT t FROM MockTest t
        WHERE (:examId IS NULL OR t.examId = :examId)
          AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%',:search,'%')))
        ORDER BY t.createdAt DESC
        """)
    Page<MockTest> findAllFiltered(
            @Param("examId") Long examId,
            @Param("search") String search,
            Pageable pageable);

    /** Student view: all published tests with optional exam filter */
    @Query("""
        SELECT t FROM MockTest t
        WHERE t.isPublished = true
          AND (:examId IS NULL OR t.examId = :examId)
          AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%',:search,'%')))
        ORDER BY t.createdAt DESC
        """)
    Page<MockTest> findPublishedFiltered(
            @Param("examId") Long examId,
            @Param("search") String search,
            Pageable pageable);

    /** Previous year papers */
    Page<MockTest> findByIsPublishedTrueAndPaperTypeAndExamId(
            String paperType, Long examId, Pageable pageable);

    Page<MockTest> findByIsPublishedTrueAndPaperType(String paperType, Pageable pageable);
}
