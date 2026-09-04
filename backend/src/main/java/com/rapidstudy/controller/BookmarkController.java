package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.question.QuestionDto;
import com.rapidstudy.service.BookmarkService;
import com.rapidstudy.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Save and manage bookmarked questions")
@SecurityRequirement(name = "bearerAuth")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get all bookmarked questions")
    public ResponseEntity<ApiResponse<Page<QuestionDto>>> getBookmarks(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = SecurityUtil.currentUserId();
        Page<QuestionDto> result = bookmarkService.getBookmarks(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Bookmarks retrieved", result));
    }

    @PostMapping("/{questionId}")
    @Operation(summary = "Bookmark a question")
    public ResponseEntity<ApiResponse<Void>> add(@PathVariable Long questionId) {
        bookmarkService.addBookmark(SecurityUtil.currentUserId(), questionId);
        return ResponseEntity.ok(ApiResponse.success("Question bookmarked", null));
    }

    @DeleteMapping("/{questionId}")
    @Operation(summary = "Remove a bookmark")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long questionId) {
        bookmarkService.removeBookmark(SecurityUtil.currentUserId(), questionId);
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }
}
