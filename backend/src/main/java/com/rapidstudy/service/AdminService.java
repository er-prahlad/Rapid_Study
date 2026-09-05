package com.rapidstudy.service;

import com.rapidstudy.dto.admin.*;
import com.rapidstudy.entity.User;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.enums.Role;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository         userRepository;
    private final ExamRepository         examRepository;
    private final QuestionRepository     questionRepository;
    private final MockTestRepository     mockTestRepository;
    private final TestAttemptRepository  attemptRepository;
    private final SubjectRepository      subjectRepository;
    private final TopicRepository        topicRepository;

    // ── Phase 38: Dashboard ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalUsers     = userRepository.count();
        long activeUsers    = userRepository.countByIsActiveTrue();
        long totalExams     = examRepository.count();
        long totalQuestions = questionRepository.count();
        long totalTests     = mockTestRepository.count();
        long totalAttempts  = attemptRepository.count();
        long todaysAttempts = attemptRepository.countBySubmittedAtAfter(LocalDate.now().atStartOfDay());
        long totalSubjects  = subjectRepository.count();
        long totalTopics    = topicRepository.count();

        // User registrations — last 7 days
        List<ChartPoint> userReg = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day  = LocalDate.now().minusDays(i);
            long count     = userRepository.countByCreatedAtAfter(day.atStartOfDay()) -
                             (i > 0 ? userRepository.countByCreatedAtAfter(day.plusDays(1).atStartOfDay()) : 0);
            // Simplified: count users created ON this day
            userReg.add(new ChartPoint(day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), Math.max(0, count)));
        }

        // Test attempts — last 7 days
        List<ChartPoint> testAttemptChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime start = LocalDate.now().minusDays(i).atStartOfDay();
            LocalDateTime end   = start.plusDays(1);
            long count = attemptRepository.countBySubmittedAtBetween(start, end);
            testAttemptChart.add(new ChartPoint(
                    LocalDate.now().minusDays(i).getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    count));
        }

        // Popular exams (top 5 by attempts)
        List<ExamPopularity> popularExams = attemptRepository.findPopularExams(PageRequest.of(0, 5))
                .stream().map(row -> new ExamPopularity(
                        ((Number) row[0]).longValue(),
                        (String)  row[1],
                        ((Number) row[2]).longValue()))
                .collect(Collectors.toList());

        // Platform-wide average score
        double avgScore = attemptRepository.findAveragePlatformScore().orElse(0.0);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers).activeUsers(activeUsers)
                .totalExams(totalExams).totalQuestions(totalQuestions)
                .totalTests(totalTests).totalAttempts(totalAttempts)
                .todaysAttempts(todaysAttempts)
                .totalSubjects(totalSubjects).totalTopics(totalTopics)
                .userRegistrations(userReg).testAttempts(testAttemptChart)
                .popularExams(popularExams)
                .averageScore(Math.round(avgScore * 100.0) / 100.0)
                .build();
    }

    // ── Phase 39: User management ───────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminUserDto> getUsers(String search, Role role, Boolean isActive, Pageable pageable) {
        String q = (search != null && !search.isBlank()) ? search.trim() : null;
        return userRepository.findAllFiltered(q, role, isActive, pageable)
                .map(u -> toAdminUserDto(u));
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUser(Long id) {
        return toAdminUserDto(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)));
    }

    @Transactional
    public AdminUserDto setUserStatus(Long id, boolean active) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        u.setIsActive(active);
        log.info("Admin set user {} isActive={}", id, active);
        return toAdminUserDto(userRepository.save(u));
    }

    @Transactional
    public AdminUserDto setUserRole(Long id, Role role) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        u.setRole(role);
        log.info("Admin set user {} role={}", id, role);
        return toAdminUserDto(userRepository.save(u));
    }

    private AdminUserDto toAdminUserDto(User u) {
        long tests = attemptRepository.countByUserIdAndStatus(u.getId(), AttemptStatus.COMPLETED);
        return AdminUserDto.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .phone(u.getPhone()).profileImage(u.getProfileImage())
                .role(u.getRole()).language(u.getLanguage())
                .isActive(u.getIsActive()).createdAt(u.getCreatedAt())
                .testsCompleted(tests)
                .build();
    }
}
