package com.rapidstudy.repository;

import com.rapidstudy.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findBySubjectIdOrderByDisplayOrderAsc(Long subjectId);

    Optional<Topic> findByIdAndSubjectId(Long id, Long subjectId);

    boolean existsByNameAndSubjectId(String name, Long subjectId);

    boolean existsByNameAndSubjectIdAndIdNot(String name, Long subjectId, Long id);

    void deleteBySubjectId(Long subjectId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Topic t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%',:q,'%')) ORDER BY t.name")
    org.springframework.data.domain.Page<Topic> searchByName(
            @org.springframework.data.repository.query.Param("q") String q,
            org.springframework.data.domain.Pageable pageable);
}
