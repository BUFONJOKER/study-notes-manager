## Golden Evaluation Dataset

**File:**

Exactly **30** unique test cases. Schema preserves the application’s real inputs (`note_id`, `note_title`, `note_subject`, `note_content`) and adds evaluation metadata.

---

### Dataset Distribution

| Difficulty   | Count |
|-------------|-------|
| Easy        | 6     |
| Normal      | 7     |
| Hard        | 6     |
| Difficult   | 5     |
| Edge Case   | 6     |

| Scenario type | Count |
|---------------|-------|
| Typical       | 12    |
| Best Case     | 7     |
| Adversarial   | 4     |
| Boundary      | 4     |
| Worst Case    | 3     |

| Workflow focus              | Count |
|-----------------------------|-------|
| End-to-end                  | 11    |
| `analyze`                   | 6     |
| `quiz_generation`           | 5     |
| `summary` / `key_concepts`  | 5     |
| Validation / multi-stage    | 3     |

Subjects span Biology, Chemistry, Physics, Mathematics, Computer Science, Economics, English, History, Geography, Psychology, and Other — matching the original CSV domains.

---

### Workflow Coverage Summary

The application is a **linear LangGraph** pipeline:

`START → analyze → summary → key_concepts → quiz_generation → END`

| Component | What is tested |
|-----------|----------------|
| **analyze** | `StudyNotesAnalysis` shape: `main_theme`, `key_points` (3–5), `interconnections`, `practical_applications`, `critical_insights`. Prompt rules: no invented facts; state missing info clearly. |
| **summary** | `SummaryOutput`: 2–3 paragraphs, **&lt;250 words**, grounded in analysis only. |
| **key_concepts** | `KeyConceptsOutput`: **8–15** distinct concepts, ordered by importance, no duplicates, no pure definitions. |
| **quiz_generation** | `QuizGenerationOutput`: **8–12** questions, mixed difficulty, understanding + application, clear wording, MCQ options allowed in text, no unsupported facts. |
| **Validation / errors** | `ValueError` when `summary_result` is empty before key_concepts, or when `key_concepts` is empty before quiz (as coded). |
| **End-to-end** | Full state propagation and length constraints across all four nodes. |

Covered failure modes: empty/whitespace content, single-sentence notes, highly repetitive text, conflicting claims, multi-topic notes without a unifying theme, markdown-only notes, very long input, missing title/subject.

---

### Evaluation Strategy

1. **Structural checks (automated)**
   - Parse outputs against the Pydantic models.
   - Assert list lengths: key_points 3–5, key_concepts 8–15, generated_questions 8–12.
   - Assert summary word count &lt; 250.

2. **Faithfulness (LLM-as-judge or human)**
   - Every claim in analysis/summary/questions must be supported by `note_content`.
   - No invented mechanisms, dates, geometries, or experiments.

3. **Conflict & sparsity handling**
   - Adversarial rows (TC-020, TC-021, TC-023, TC-024) score higher when contradictions or thin content are acknowledged rather than silently resolved or padded with hallucinations.

4. **Error path**
   - Empty/whitespace inputs (TC-025, TC-030) should either produce an explicit “missing information” analysis or raise the coded `ValueError`s; fabricating a full topic is a fail.

5. **Consistency**
   - Similar clean notes (Easy/Normal best-case) should yield stable themes and overlapping concept sets across runs.

Use the `evaluation_criteria` column as the per-row scoring rubric.

---

### Potential Weaknesses the Dataset Targets

1. **Hard length floors on sparse input** — `key_concepts` min 8 and questions min 8 push the model to invent content when notes contain only 1–2 facts (TC-022, TC-026).
2. **No explicit handling of empty content** — empty or whitespace `note_content` still flows into the LLM; downstream `ValueError`s are the only guard (TC-025, TC-030).
3. **Conflict blindness** — prompts never instruct the model to surface contradictions; it may pick one side (TC-020, TC-023).
4. **Multi-topic notes** — single `main_theme` field may force a false unification (TC-021).
5. **Repetition** — no dedup step before structured extraction; concepts/questions can echo (TC-024, TC-028).
6. **Application hallucination** — practical_applications and critical_insights sometimes expand beyond the notes (especially Physics/Biology rows).
7. **Linear pipeline only** — no recovery or branching; any early failure aborts the rest.

The 30 cases are designed to surface these issues while still rewarding correct structured, grounded outputs on clean inputs.