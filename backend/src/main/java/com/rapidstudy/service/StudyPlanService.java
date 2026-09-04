package com.rapidstudy.service;

import com.rapidstudy.dto.studyplan.StudyPlanDto;
import com.rapidstudy.dto.studyplan.StudyPlanRequest;
import com.rapidstudy.entity.StudyPlan;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.StudyPlanRepository;
import com.rapidstudy.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private final StudyPlanRepository     planRepository;
    private final TestAttemptRepository   attemptRepository;

    @Transactional(readOnly = true)
    public List<StudyPlanDto> getPlans(Long userId) {
        return planRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(p -> toDto(p, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyPlanDto getPlan(Long id, Long userId) {
        StudyPlan p = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"));
        return toDto(p, userId);
    }

    @Transactional
    public StudyPlanDto createPlan(StudyPlanRequest req, Long userId) {
        if (req.getEndDate().isBefore(req.getStartDate()))
            throw new BadRequestException("End date must be after start date");
        StudyPlan p = new StudyPlan();
        applyRequest(p, req, userId);
        return toDto(planRepository.save(p), userId);
    }

    @Transactional
    public StudyPlanDto updatePlan(Long id, StudyPlanRequest req, Long userId) {
        StudyPlan p = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"));
        if (req.getEndDate().isBefore(req.getStartDate()))
            throw new BadRequestException("End date must be after start date");
        applyRequest(p, req, userId);
        return toDto(planRepository.save(p), userId);
    }

    @Transactional
    public void deletePlan(Long id, Long userId) {
        StudyPlan p = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"));
        planRepository.delete(p);
    }

    private void applyRequest(StudyPlan p, StudyPlanRequest req, Long userId) {
        p.setUserId(userId);
        p.setTitle(req.getTitle());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        p.setTargetTests(req.getTargetTests() != null ? req.getTargetTests() : 0);
        p.setTargetQuestions(req.getTargetQuestions() != null ? req.getTargetQuestions() : 0);
        p.setIsActive(true);
    }

    private StudyPlanDto toDto(StudyPlan p, Long userId) {
        LocalDate today = LocalDate.now();
        long daysTotal     = ChronoUnit.DAYS.between(p.getStartDate(), p.getEndDate()) + 1;
        long daysElapsed   = Math.max(0, Math.min(daysTotal,
                ChronoUnit.DAYS.between(p.getStartDate(), today) + 1));
        long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(today, p.getEndDate()));

        // Tests completed since plan start
        int testsCompleted = (int) attemptRepository.findByUserIdAndStatus(
                userId, AttemptStatus.COMPLETED,
                org.springframework.data.domain.PageRequest.of(0, 1000))
                .stream()
                .filter(a -> a.getSubmittedAt() != null
                        && !a.getSubmittedAt().toLocalDate().isBefore(p.getStartDate())
                        && !a.getSubmittedAt().toLocalDate().isAfter(p.getEndDate()))
                .count();

        // Simple progress = (daysElapsed / daysTotal) * 100, capped at 100
        double progressPct = daysTotal > 0
                ? Math.min(100.0, (double) daysElapsed / daysTotal * 100) : 0;

        return StudyPlanDto.builder()
                .id(p.getId()).title(p.getTitle())
                .startDate(p.getStartDate()).endDate(p.getEndDate())
                .targetTests(p.getTargetTests()).targetQuestions(p.getTargetQuestions())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .testsCompleted(testsCompleted).questionsAttempted(0)
                .daysTotal((int) daysTotal).daysElapsed((int) daysElapsed)
                .daysRemaining((int) daysRemaining)
                .progressPercent(Math.round(progressPct * 10.0) / 10.0)
                .build();
    }
}
