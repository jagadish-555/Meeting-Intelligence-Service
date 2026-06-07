# AI Integration Approach

This document outlines the strategy used to integrate the Large Language Model (LLM) into the Meeting Intelligence Service, specifically focusing on prompt design, grounding, and preventing hallucinations.

## 1. Prompt Design

The system uses a heavily structured, zero-shot system prompt tailored for Groq's LLaMA 3.3 model. 

Key design elements:
- **Strict Ruleset:** The prompt leads with an aggressive, capitalized ruleset ("STRICT RULES — YOU MUST FOLLOW THESE") explicitly forbidding the invention of attendees, tasks, or meeting outcomes.
- **Context Injection:** The backend dynamically injects contextual metadata into the prompt, such as the exact meeting date (e.g., `2026-06-07`) and the valid array of timestamps.
- **Relative Date Resolution:** By providing the meeting date in the prompt, the AI is instructed to automatically resolve relative deadlines like "by next Friday" into explicit ISO 8601 strings (`YYYY-MM-DD`).
- **Participant Cross-Referencing:** The prompt injects the `participants` array (e.g., `["alice@example.com", "bob@example.com"]`) and forces the AI to match extracted assignees to these exact email addresses, preventing invalid user assignment.

## 2. Citation Strategy

Citations are deeply integrated into the expected JSON output schema. The prompt strictly demands that *every* generated insight (summary point, decision, action item, suggestion) contains a `citations` array.

To assist the model, the backend extracts all valid timestamps from the provided transcript and injects them directly into the prompt (e.g., `Valid timestamps you may cite: ["00:10", "00:20"]`).

## 3. Hallucination Prevention Approach

Beyond prompt engineering, the backend implements a deterministic, programmatic **Grounding Filter** (`filterCitations` in `aiService.js`).

1. **Extraction:** The AI returns the analysis block.
2. **Sanitization:** The backend code loops through every single citation returned by the AI.
3. **Verification:** It checks if the cited timestamp actually exists in the original transcript array.
4. **Pruning:** If the AI hallucinates a timestamp that does not exist in the source text, that citation is silently stripped out. 

This guarantees that 100% of the citations returned to the client are verifiably grounded in the source data.

## 4. Output Validation Strategy

LLMs natively output plain text, which is inherently risky for backend consumption. To mitigate this:
1. We enforce `response_format: { type: "json_object" }` at the API level.
2. We pipe the raw JSON string through a **Zod** validation schema (`analysisSchema`).
3. Zod strictly type-checks the payload (ensuring `actionItems` is an array, `assignee` is an email string, `dueDate` is an ISO date). If the AI hallucinates a malformed structure, Zod catches it and throws a safe backend validation error.

## 5. Known Limitations

- **Context Windows:** Extremely long meetings (e.g., 4-hour transcripts) may exceed the token limit of the LLM. In a future iteration, chunking or map-reduce summarization would be required.
- **Implicit Deduplication:** If two speakers assign the same task at different times, the AI might output duplicate action items rather than merging them.
