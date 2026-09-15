package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/v1/search?q=...&size=10
 * Returns matched exams, tests, questions and topics.
 * Public endpoint — no auth required.
 */
@RestController
@RequestMapping({"/api/v1/search", "/api/search"})
@RequiredArgsConstructor
@Tag(name = "Search", description = "Unified search across exams, tests, questions and topics")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search exams, tests, questions and topics")
    public ResponseEntity<ApiResponse<SearchService.SearchResult>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int size) {
        SearchService.SearchResult result = searchService.search(q, Math.min(size, 20));
        return ResponseEntity.ok(ApiResponse.success("Search results", result));
    }
}
