package com.rapidstudy.repository;

import com.rapidstudy.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    Optional<Exam> findByCode(String code);

    List<Exam> findByIsActiveTrueOrderByNameAsc();

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    /** Search by name or code, active only */
    @Query("SELECT e FROM Exam e WHERE e.isActive = true AND " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(e.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Exam> searchActive(@Param("q") String query, Pageable pageable);

    /** All active exams, paginated */
    Page<Exam> findByIsActiveTrueOrderByNameAsc(Pageable pageable);

    /** All exams (admin), with optional name search */
    @Query("SELECT e FROM Exam e WHERE " +
           "(:q IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(e.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Exam> findAllWithSearch(@Param("q") String query, Pageable pageable);
}
