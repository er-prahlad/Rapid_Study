package com.rapidstudy.repository;

import com.rapidstudy.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByExamIdOrderByDisplayOrderAsc(Long examId);

    Optional<Subject> findByIdAndExamId(Long id, Long examId);

    boolean existsByNameAndExamId(String name, Long examId);

    boolean existsByNameAndExamIdAndIdNot(String name, Long examId, Long id);

    void deleteByExamId(Long examId);
}
