package com.rapidstudy.service;

import com.rapidstudy.dto.question.*;
import com.rapidstudy.entity.Option;
import com.rapidstudy.entity.Question;
import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.enums.QuestionType;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.OptionRepository;
import com.rapidstudy.repository.QuestionRepository;
import com.rapidstudy.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final OptionRepository   optionRepository;
    private final TopicRepository    topicRepository;

    // ──────────────────────────────────────────────────────────────────
    // PHASE 18: Question CRUD
    // ──────────────────────────────────────────────────────────────────

    /** Admin: full list with answer keys */
    @Transactional(readOnly = true)
    public Page<QuestionDto> getQuestions(
            Long topicId, Long subjectId,
            Difficulty difficulty, Boolean isActive,
            String search, Pageable pageable) {

        return questionRepository
                .findFiltered(topicId, subjectId, difficulty, isActive, search, pageable)
                .map(q -> toDto(q, true));
    }

    /** Student: list without answer keys */
    @Transactional(readOnly = true)
    public Page<QuestionSafeDto> getPracticeQuestions(
            Long topicId, Long subjectId,
            Difficulty difficulty, Pageable pageable) {

        return questionRepository
                .findFiltered(topicId, subjectId, difficulty, true, null, pageable)
                .map(this::toSafeDto);
    }

    /** Admin: single question with answers */
    @Transactional(readOnly = true)
    public QuestionDto getById(Long id) {
        Question q = findOrThrow(id);
        return toDto(q, true);
    }

    @Transactional
    public QuestionDto createQuestion(QuestionRequest req) {
        validateRequest(req);
        topicRepository.findById(req.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + req.getTopicId()));

        Question q = new Question();
        applyRequest(q, req);
        Question saved = questionRepository.save(q);
        saveOptions(saved.getId(), req.getOptions());
        log.info("Created question id={}", saved.getId());
        return toDto(saved, true);
    }

    @Transactional
    public QuestionDto updateQuestion(Long id, QuestionRequest req) {
        validateRequest(req);
        Question q = findOrThrow(id);
        applyRequest(q, req);
        questionRepository.save(q);

        // Replace all options
        optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByOptionOrderAsc(id));
        saveOptions(id, req.getOptions());
        return toDto(q, true);
    }

    @Transactional
    public void deactivateQuestion(Long id) {
        Question q = findOrThrow(id);
        q.setIsActive(false);
        questionRepository.save(q);
    }

    @Transactional
    public void activateQuestion(Long id) {
        Question q = findOrThrow(id);
        q.setIsActive(true);
        questionRepository.save(q);
    }

    // ──────────────────────────────────────────────────────────────────
    // PHASE 19: CSV / XLSX Import
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public ImportResultDto importQuestions(MultipartFile file) {
        String name = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase() : "";
        if (name.endsWith(".csv"))  return importCsv(file);
        if (name.endsWith(".xlsx") || name.endsWith(".xls")) return importXlsx(file);
        throw new BadRequestException("Unsupported file. Use .csv or .xlsx");
    }

    // ── CSV ──────────────────────────────────────────────────────────

    private ImportResultDto importCsv(MultipartFile file) {
        int total = 0, imported = 0, failed = 0, duplicates = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), "UTF-8"))) {

            String headerLine = br.readLine();
            if (headerLine == null) throw new BadRequestException("Empty file");

            String line;
            int row = 1;
            while ((line = br.readLine()) != null) {
                row++; total++;
                try {
                    RowResult result = processRow(parseCsvLine(line), row);
                    if      (result.isOk())        { imported++; }
                    else if (result.isDuplicate())  { duplicates++; errors.add(result.getMessage()); }
                    else                            { failed++;    errors.add(result.getMessage()); }
                } catch (Exception e) {
                    failed++;
                    errors.add("Row " + row + ": " + e.getMessage());
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV: " + e.getMessage());
        }

        return build(total, imported, failed, duplicates, errors);
    }

    // ── XLSX ─────────────────────────────────────────────────────────

    private ImportResultDto importXlsx(MultipartFile file) {
        int total = 0, imported = 0, failed = 0, duplicates = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            boolean first = true;
            int row = 0;
            for (Row r : sheet) {
                row++;
                if (first) { first = false; continue; } // header
                total++;
                try {
                    String[] cols = toStringArray(r, 13);
                    RowResult result = processRow(cols, row);
                    if      (result.isOk())       { imported++; }
                    else if (result.isDuplicate()) { duplicates++; errors.add(result.getMessage()); }
                    else                           { failed++;    errors.add(result.getMessage()); }
                } catch (Exception e) {
                    failed++;
                    errors.add("Row " + row + ": " + e.getMessage());
                }
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read XLSX: " + e.getMessage());
        }

        return build(total, imported, failed, duplicates, errors);
    }

    /**
     * Columns (0-indexed):
     *  0  topicId
     *  1  questionText
     *  2  questionTextHindi  (optional)
     *  3  difficulty         (EASY / MEDIUM / HARD)
     *  4  marks
     *  5  negativeMarks
     *  6  option1Text
     *  7  option2Text
     *  8  option3Text
     *  9  option4Text
     * 10  correctOption      (1-4)
     * 11  explanation        (optional)
     * 12  explanationHindi   (optional)
     */
    private RowResult processRow(String[] cols, int rowNum) {
        if (cols.length < 11)
            return RowResult.fail("Row " + rowNum + ": need at least 11 columns");

        long topicId;
        try { topicId = Long.parseLong(col(cols, 0)); }
        catch (NumberFormatException e) {
            return RowResult.fail("Row " + rowNum + ": invalid topicId '" + col(cols, 0) + "'");
        }
        if (!topicRepository.existsById(topicId))
            return RowResult.fail("Row " + rowNum + ": topic " + topicId + " not found");

        String qText = col(cols, 1);
        if (qText.isBlank())
            return RowResult.fail("Row " + rowNum + ": question text is blank");

        if (!questionRepository.findByQuestionTextAndTopicId(qText, topicId).isEmpty())
            return RowResult.duplicate("Row " + rowNum + ": duplicate question");

        int correctOpt;
        try { correctOpt = Integer.parseInt(col(cols, 10)); }
        catch (NumberFormatException e) {
            return RowResult.fail("Row " + rowNum + ": correctOption must be a number 1-4");
        }
        if (correctOpt < 1 || correctOpt > 4)
            return RowResult.fail("Row " + rowNum + ": correctOption must be 1-4");

        Question q = new Question();
        q.setTopicId(topicId);
        q.setQuestionText(qText);
        q.setQuestionTextHindi(nullIfBlank(col(cols, 2)));
        q.setDifficulty(parseDifficulty(col(cols, 3)));
        q.setMarks(parseBd(col(cols, 4), BigDecimal.ONE));
        q.setNegativeMarks(parseBd(col(cols, 5), BigDecimal.ZERO));
        q.setExplanation(nullIfBlank(col(cols, 11)));
        q.setExplanationHindi(nullIfBlank(col(cols, 12)));
        q.setIsActive(true);

        Question saved = questionRepository.save(q);

        for (int i = 0; i < 4; i++) {
            String optText = col(cols, 6 + i);
            if (optText.isBlank()) continue;
            Option opt = new Option();
            opt.setQuestionId(saved.getId());
            opt.setOptionText(optText);
            opt.setOptionOrder(i + 1);
            opt.setIsCorrect(i + 1 == correctOpt);
            optionRepository.save(opt);
        }
        return RowResult.ok();
    }

    // ──────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────

    private Question findOrThrow(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + id));
    }

    private void validateRequest(QuestionRequest req) {
        long correctCount = req.getOptions().stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();
        if (req.getQuestionType() == QuestionType.MCQ && correctCount != 1)
            throw new BadRequestException("MCQ must have exactly 1 correct option");
        if (req.getQuestionType() == QuestionType.MULTI_SELECT && correctCount < 2)
            throw new BadRequestException("MULTI_SELECT must have at least 2 correct options");
    }

    private void applyRequest(Question q, QuestionRequest req) {
        q.setTopicId(req.getTopicId());
        q.setQuestionText(req.getQuestionText());
        q.setQuestionTextHindi(req.getQuestionTextHindi());
        q.setQuestionType(req.getQuestionType() != null ? req.getQuestionType() : QuestionType.MCQ);
        q.setDifficulty(req.getDifficulty() != null ? req.getDifficulty() : Difficulty.MEDIUM);
        q.setExplanation(req.getExplanation());
        q.setExplanationHindi(req.getExplanationHindi());
        q.setMarks(req.getMarks() != null ? req.getMarks() : BigDecimal.ONE);
        q.setNegativeMarks(req.getNegativeMarks() != null ? req.getNegativeMarks() : BigDecimal.ZERO);
        q.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
    }

    private void saveOptions(Long questionId, List<OptionRequest> options) {
        for (int i = 0; i < options.size(); i++) {
            OptionRequest or = options.get(i);
            Option opt = new Option();
            opt.setQuestionId(questionId);
            opt.setOptionText(or.getOptionText());
            opt.setOptionTextHindi(or.getOptionTextHindi());
            opt.setOptionOrder(or.getOptionOrder() != null ? or.getOptionOrder() : i + 1);
            opt.setIsCorrect(Boolean.TRUE.equals(or.getIsCorrect()));
            optionRepository.save(opt);
        }
    }

    public QuestionDto toDto(Question q, boolean includeAnswers) {
        List<Option> opts = optionRepository.findByQuestionIdOrderByOptionOrderAsc(q.getId());
        List<OptionDto> optDtos = opts.stream().map(o -> OptionDto.builder()
                .id(o.getId())
                .optionText(o.getOptionText())
                .optionTextHindi(o.getOptionTextHindi())
                .optionOrder(o.getOptionOrder())
                .isCorrect(includeAnswers ? o.getIsCorrect() : null)
                .build()).collect(Collectors.toList());

        String topicName  = q.getTopic() != null ? q.getTopic().getName() : null;
        String subjName   = (q.getTopic() != null && q.getTopic().getSubject() != null)
                            ? q.getTopic().getSubject().getName() : null;
        String examName   = (q.getTopic() != null && q.getTopic().getSubject() != null
                            && q.getTopic().getSubject().getExam() != null)
                            ? q.getTopic().getSubject().getExam().getName() : null;

        return QuestionDto.builder()
                .id(q.getId())
                .topicId(q.getTopicId())
                .topicName(topicName)
                .subjectName(subjName)
                .examName(examName)
                .questionText(q.getQuestionText())
                .questionTextHindi(q.getQuestionTextHindi())
                .questionType(q.getQuestionType())
                .difficulty(q.getDifficulty())
                .explanation(q.getExplanation())
                .explanationHindi(q.getExplanationHindi())
                .marks(q.getMarks())
                .negativeMarks(q.getNegativeMarks())
                .isActive(q.getIsActive())
                .createdAt(q.getCreatedAt())
                .options(optDtos)
                .build();
    }

    public QuestionSafeDto toSafeDto(Question q) {
        List<Option> opts = optionRepository.findByQuestionIdOrderByOptionOrderAsc(q.getId());
        List<OptionDto> optDtos = opts.stream().map(o -> OptionDto.builder()
                .id(o.getId())
                .optionText(o.getOptionText())
                .optionTextHindi(o.getOptionTextHindi())
                .optionOrder(o.getOptionOrder())
                .isCorrect(null) // NEVER include correct answer for students
                .build()).collect(Collectors.toList());

        String topicName = q.getTopic() != null ? q.getTopic().getName() : null;

        return QuestionSafeDto.builder()
                .id(q.getId()).topicId(q.getTopicId()).topicName(topicName)
                .questionText(q.getQuestionText()).questionTextHindi(q.getQuestionTextHindi())
                .questionType(q.getQuestionType()).difficulty(q.getDifficulty())
                .marks(q.getMarks()).negativeMarks(q.getNegativeMarks())
                .options(optDtos).build();
    }

    // ── CSV/XLSX utility helpers ──────────────────────────────────────

    private String[] parseCsvLine(String line) {
        // Handles quoted fields with commas inside
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '"') { inQuotes = !inQuotes; }
            else if (c == ',' && !inQuotes) { result.add(current.toString()); current = new StringBuilder(); }
            else { current.append(c); }
        }
        result.add(current.toString());
        return result.toArray(new String[0]);
    }

    private String[] toStringArray(Row row, int maxCols) {
        String[] arr = new String[maxCols];
        for (int i = 0; i < maxCols; i++) {
            Cell cell = row.getCell(i);
            arr[i] = cell == null ? "" : switch (cell.getCellType()) {
                case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default      -> cell.getStringCellValue().trim();
            };
        }
        return arr;
    }

    private String col(String[] cols, int i) {
        return (i < cols.length && cols[i] != null) ? cols[i].trim() : "";
    }

    private String nullIfBlank(String s) { return (s == null || s.isBlank()) ? null : s; }

    private Difficulty parseDifficulty(String s) {
        try { return Difficulty.valueOf(s.toUpperCase()); }
        catch (Exception e) { return Difficulty.MEDIUM; }
    }

    private BigDecimal parseBd(String s, BigDecimal def) {
        try { return new BigDecimal(s); }
        catch (Exception e) { return def; }
    }

    private ImportResultDto build(int t, int i, int f, int d, List<String> e) {
        return ImportResultDto.builder().totalRows(t).imported(i).failed(f).duplicates(d).errors(e).build();
    }

    // ── Inner class for import row result ────────────────────────────

    private static class RowResult {
        enum Type { OK, FAIL, DUPLICATE }
        private final Type   type;
        private final String message;
        RowResult(Type t, String m) { this.type = t; this.message = m; }
        static RowResult ok()                   { return new RowResult(Type.OK, null); }
        static RowResult fail(String m)         { return new RowResult(Type.FAIL, m); }
        static RowResult duplicate(String m)    { return new RowResult(Type.DUPLICATE, m); }
        boolean isOk()        { return type == Type.OK; }
        boolean isDuplicate() { return type == Type.DUPLICATE; }
        String  getMessage()  { return message; }
    }
}
