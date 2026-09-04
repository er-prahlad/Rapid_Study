package com.rapidstudy.service;

import com.rapidstudy.dto.question.QuestionDto;
import com.rapidstudy.entity.Bookmark;
import com.rapidstudy.exception.ConflictException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.BookmarkRepository;
import com.rapidstudy.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService    questionService;

    @Transactional(readOnly = true)
    public Page<QuestionDto> getBookmarks(Long userId, Pageable pageable) {
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId, pageable);

        List<QuestionDto> dtos = bookmarks.getContent().stream()
                .map(b -> questionRepository.findById(b.getQuestionId()).orElse(null))
                .filter(q -> q != null)
                .map(q -> questionService.toDto(q, true))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, bookmarks.getTotalElements());
    }

    @Transactional
    public void addBookmark(Long userId, Long questionId) {
        questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
        if (bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId))
            throw new ConflictException("Question is already bookmarked");
        Bookmark b = new Bookmark();
        b.setUserId(userId);
        b.setQuestionId(questionId);
        bookmarkRepository.save(b);
    }

    @Transactional
    public void removeBookmark(Long userId, Long questionId) {
        if (!bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId))
            throw new ResourceNotFoundException("Bookmark not found");
        bookmarkRepository.deleteByUserIdAndQuestionId(userId, questionId);
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, Long questionId) {
        return bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId);
    }
}
