I have provided a dataset from my LLM-based application. Analyze the dataset carefully and use it as the foundation for creating a **30-row Golden Evaluation Dataset** to comprehensively evaluate my application's performance.

### Requirements

1. **Analyze the Original Dataset**
   - Understand the dataset's structure, columns, data types, and purpose.
   - Identify the different types of inputs, expected outputs, and use cases.
   - Preserve the original dataset's domain, context, and evaluation objectives.

2. **Generate 30 Golden Dataset Rows**
   - Create exactly 30 diverse and realistic test cases.
   - Include a balanced mix of scenarios with varying complexity:
     - **Easy:** Straightforward inputs with obvious expected outputs.
     - **Normal:** Typical real-world use cases.
     - **Hard:** Complex inputs requiring deeper reasoning and multiple steps.
     - **Difficult/Edge Cases:** Unusual, ambiguous, incomplete, or challenging inputs.
     - **Best-Case Scenarios:** Ideal inputs where the application should produce excellent results.
     - **Worst-Case Scenarios:** Adversarial, confusing, malformed, or unexpected inputs that test the application's limitations and error handling.

3. **Quality and Diversity**
   - Avoid duplicate or overly similar test cases.
   - Include realistic scenarios rather than artificial examples.
   - Test both successful outputs and potential failure cases.
   - Ensure expected outputs are accurate, specific, and consistent with the application's intended behavior.
   - Include cases that expose weaknesses, hallucinations, incorrect reasoning, and inconsistent responses.

4. **Evaluation Readiness**
   - Preserve the original dataset's schema and column naming conventions wherever possible.
   - Add useful evaluation metadata where appropriate, such as:
     - `difficulty_level`
     - `scenario_type`
     - `expected_behavior`
     - `evaluation_criteria`
   - Make every row independently usable for automated or manual evaluation.

5. **Final Deliverable**
   - Generate exactly 30 rows.
   - Return the completed dataset in a structured, machine-readable CSV or Excel format.
   - Ensure there are no missing required values, invalid structures, or inconsistent labels.
   - Provide a brief breakdown of how many test cases belong to each difficulty level and scenario type.

### Important Instructions
- Do not blindly generate random examples.
- Base every test case on the actual functionality and data patterns of my application.
- Do not change the application's intended behavior or invent unsupported features.
- Prioritize evaluation coverage, realistic scenarios, and high-quality expected outputs over simple dataset expansion.

**Goal:** Create a reliable golden dataset that I can use to benchmark my LLM-based application, identify performance weaknesses, evaluate response quality, and track improvements across different difficulty levels and edge cases.