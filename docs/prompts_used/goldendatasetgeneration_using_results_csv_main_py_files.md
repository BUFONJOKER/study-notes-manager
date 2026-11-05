# Task: Generate a 30-Row Golden Evaluation Dataset for My LLM Application

I will provide two inputs:

1. **Original Dataset (CSV):** Contains sample data used by my LLM-based application.
2. **Complete Workflow Source Code:** Contains the application's full workflow, including processing logic, prompts, LLM interactions, nodes, conditional routing, validation, and output generation.

Your task is to thoroughly analyze both inputs and generate a high-quality **30-row Golden Evaluation Dataset** that can be used to evaluate the correctness, reliability, robustness, and overall performance of my LLM application.

## 1. Analyze the Provided Files

Before generating any test cases:

**Analyze the CSV dataset:**
- Understand its schema, columns, data types, and relationships.
- Identify the purpose and patterns of the existing records.
- Understand the input and output formats.
- Identify the different scenarios represented in the dataset.

**Analyze the complete workflow code:**
- Understand the application's end-to-end execution flow.
- Identify each workflow step, node, function, and conditional branch.
- Understand the role of each LLM call and its associated prompts.
- Identify input validation, output validation, error handling, and fallback mechanisms.
- Understand the expected behavior at every important stage.
- Identify potential failure points and limitations.

**Important:** Do not generate the golden dataset until you understand how the application actually works. The source code defines the application's intended behavior, while the CSV provides realistic data and examples.

## 2. Generate Exactly 30 Evaluation Test Cases

Create 30 diverse test cases covering the following difficulty levels:

| Difficulty | Description |
|---|---|
| Easy | Simple inputs and straightforward scenarios. |
| Normal | Common real-world scenarios the application should handle reliably. |
| Hard | Complex inputs requiring deeper reasoning, multiple processing steps, or more sophisticated outputs. |
| Difficult | Highly challenging scenarios involving ambiguity, conflicting information, incomplete context, or unusual inputs. |
| Edge Cases | Boundary conditions, empty fields, missing values, unexpected formats, and unusual inputs. |

Also include both:

- **Best-case scenarios:** Inputs where the application should produce accurate, complete, and high-quality results.
- **Worst-case scenarios:** Inputs designed to expose weaknesses, incorrect reasoning, hallucinations, workflow failures, and poor error handling.

Ensure that all 30 cases collectively provide meaningful coverage of the application's workflow. Distribute them across difficulty levels and scenario types rather than generating repetitive examples.

## 3. Golden Expected Outputs

For every test case:

- Provide the expected output based on the application's actual implementation and intended behavior.
- Ensure expected outputs are accurate, realistic, and technically consistent with the workflow code.
- Account for the application's prompts, validation rules, processing logic, and output structure.
- Include expected errors or rejection behavior when an input should fail.
- Do not invent functionality that does not exist in the application.
- Do not assume that every input must produce a successful result.

For LLM-generated outputs that allow some variation, define the essential expected properties and evaluation criteria instead of requiring exact wording.

## 4. Evaluation Metadata

Preserve the original CSV schema and column names wherever possible.

Add appropriate evaluation columns if they are not already present:

- `test_case_id`: Unique identifier for each test case.
- `difficulty_level`: Easy, Normal, Hard, Difficult, or Edge Case.
- `scenario_type`: Best Case, Worst Case, Typical, Boundary, Adversarial, etc.
- `input`: Input supplied to the application, following its actual input format.
- `expected_output`: Golden reference output.
- `expected_behavior`: What the application should do.
- `evaluation_criteria`: Specific conditions used to determine whether the result is correct.
- `workflow_component`: Relevant workflow node, function, or processing stage being evaluated.

Adapt these columns to the actual CSV structure and workflow. Do not force unnecessary columns or change existing application-specific fields.

## 5. Workflow Coverage

Ensure that the evaluation dataset tests:

- Individual workflow components.
- End-to-end execution.
- Different conditional branches.
- Input validation and output validation.
- LLM reasoning and response quality.
- Missing, incomplete, and ambiguous inputs.
- Unexpected or malformed inputs.
- Error handling and recovery mechanisms.
- Consistency across similar inputs.
- Potential hallucinations and unsupported outputs.

Prioritize scenarios that are likely to reveal actual weaknesses in the provided implementation.

## 6. Quality Assurance

Before finalizing the dataset, verify that:

- There are exactly 30 unique test cases.
- No test cases are unnecessarily duplicated.
- Every test case follows the application's actual input schema.
- Every expected output is consistent with the workflow implementation.
- All difficulty and scenario labels are consistent.
- Edge cases are technically valid evaluation scenarios.
- Best-case and worst-case scenarios are meaningfully represented.
- Every test case has clear evaluation criteria.
- The resulting CSV is properly formatted and ready for evaluation.

Do not execute or modify my application code unless explicitly requested. Use the provided code for analysis and understanding.

## 7. Final Deliverables

Provide:

1. **Golden Evaluation Dataset:** A downloadable CSV file containing exactly 30 rows.
2. **Dataset Distribution:** A breakdown of test cases by difficulty level and scenario type.
3. **Workflow Coverage Summary:** Explain which workflow components and execution paths are covered.
4. **Evaluation Strategy:** Briefly explain how the dataset can be used to evaluate the application's accuracy, reliability, robustness, and output quality.
5. **Potential Weaknesses:** Identify important workflow weaknesses discovered during code analysis that the dataset is designed to test.

### Final Objective

Create a high-quality, application-specific golden evaluation dataset that serves as a reliable benchmark for my LLM application.

The dataset must evaluate the application based on its actual workflow and expected behavior, not generic LLM testing assumptions. Prioritize correctness, comprehensive workflow coverage, realistic test scenarios, and measurable evaluation criteria.