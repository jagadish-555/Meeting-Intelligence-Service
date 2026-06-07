import Groq from "groq-sdk";
import { z } from "zod";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const citationSchema = z.object({
  timestamp: z.string(),
});

const analysisSchema = z.object({
  summary: z
    .array(
      z.object({
        text: z.string(),
        citations: z.array(citationSchema).optional(),
      })
    )
    .optional()
    .default([]),
  actionItems: z
    .array(
      z.object({
        task: z.string(),
        assignee: z.string().optional(),
        dueDate: z.string().nullable().optional(),
        citations: z.array(citationSchema).optional(),
      })
    )
    .optional()
    .default([]),
  decisions: z
    .array(
      z.object({
        text: z.string(),
        citations: z.array(citationSchema).optional(),
      })
    )
    .optional()
    .default([]),
  followUpSuggestions: z
    .array(
      z.object({
        text: z.string(),
        citations: z.array(citationSchema).optional(),
      })
    )
    .optional()
    .default([]),
});

const analyzeMeeting = async (transcript, meetingDate) => {
  const validTimestamps = transcript.map((e) => e.timestamp);
  const meetingDateStr = meetingDate
    ? new Date(meetingDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const transcriptText = transcript
    .map((e) => `[${e.timestamp}] ${e.speaker}: ${e.text}`)
    .join("\n");

  const prompt = `You are a meeting analysis assistant. Analyze the transcript below.

STRICT RULES — YOU MUST FOLLOW THESE:
1. Only extract information that is EXPLICITLY stated in the transcript.
2. Do NOT invent attendees, tasks, decisions, or any information not present.
3. Every item MUST include at least one citation referencing an actual timestamp.
4. Valid timestamps you may cite: ${JSON.stringify(validTimestamps)}
5. If something is not clearly mentioned, do not include it.
6. The meeting took place on: ${meetingDateStr}. Use this as the reference date when resolving relative due dates like "by Friday", "next week", "end of month", etc.
7. For each action item, extract a dueDate if any deadline is mentioned (explicitly or relatively). Return it as an ISO 8601 date string (YYYY-MM-DD). If no due date is mentioned, set dueDate to null.

TRANSCRIPT:
${transcriptText}

Respond ONLY with a JSON object in this exact structure, no markdown, no explanation:
{
  "summary": [
    { "text": "concise summary point", "citations": [{ "timestamp": "MM:SS" }] }
  ],
  "actionItems": [
    { "task": "specific task", "assignee": "person name", "dueDate": "YYYY-MM-DD or null", "citations": [{ "timestamp": "MM:SS" }] }
  ],
  "decisions": [
    { "text": "decision made", "citations": [{ "timestamp": "MM:SS" }] }
  ],
  "followUpSuggestions": [
    { "text": "follow-up suggestion", "citations": [{ "timestamp": "MM:SS" }] }
  ]
}`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content.trim();

  let parsedJson;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned invalid JSON");
    parsedJson = JSON.parse(match[0]);
  }

  const analysis = analysisSchema.parse(parsedJson);

  const filterCitations = (items = []) =>
    items.map((item) => ({
      ...item,
      citations: (item.citations || []).filter((c) =>
        validTimestamps.includes(c.timestamp)
      ),
    }));

  return {
    summary: filterCitations(analysis.summary),
    actionItems: filterCitations(analysis.actionItems),
    decisions: filterCitations(analysis.decisions),
    followUpSuggestions: filterCitations(analysis.followUpSuggestions),
  };
};

export default { analyzeMeeting };
