package com.rapidstudy.repository;

import com.rapidstudy.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Bookmark entity
 */
@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    
    Page<Bookmark> findByUserId(Long userId, Pageable pageable);
    
    Optional<Bookmark> findByUserIdAndQuestionId(Long userId, Long questionId);
    
    boolean existsByUserIdAndQuestionId(Long userId, Long questionId);
    
    void deleteByUserIdAndQuestionId(Long userId, Long questionId);
}
