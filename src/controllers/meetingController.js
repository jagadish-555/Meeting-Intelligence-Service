import { z } from "zod";
import prisma from "../config/db.js";
import { success } from "../utils/response.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import aiService from "../services/aiService.js";

const transcriptEntrySchema = z.object({
  timestamp: z.string().min(1),
  speaker: z.string().min(1),
  text: z.string().min(1),
});

const createMeetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  participants: z
    .array(z.string().email("Invalid participant email"))
    .min(1, "At least one participant required"),
  meetingDate: z.string().datetime("Invalid meeting date"),
  transcript: z
    .array(transcriptEntrySchema)
    .min(1, "Transcript cannot be empty"),
});

const createMeeting = async (req, res, next) => {
  try {
    const parsed = createMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg =
        parsed.error?.issues?.[0]?.message ||
        parsed.error?.errors?.[0]?.message ||
        "Validation Error";
      throw new ValidationError(errorMsg);
    }

    const { title, participants, meetingDate, transcript } = parsed.data;

    const meeting = await prisma.meeting.create({
      data: {
        title,
        participants,
        meetingDate: new Date(meetingDate),
        transcript,
        createdBy: req.user.id,
      },
    });

    return success(res, { meeting }, 201);
  } catch (err) {
    next(err);
  }
};

const getMeeting = async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: { analysis: true, actionItems: true },
    });

    if (!meeting) throw new NotFoundError("Meeting");
    return success(res, { meeting });
  } catch (err) {
    next(err);
  }
};

const listMeetings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, meetings] = await prisma.$transaction([
      prisma.meeting.count({ where: { createdBy: req.user.id } }),
      prisma.meeting.findMany({
        where: { createdBy: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return success(res, {
      meetings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const analyzeMeeting = async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
    });
    if (!meeting) throw new NotFoundError("Meeting");

    const existing = await prisma.meetingAnalysis.findUnique({
      where: { meetingId: meeting.id },
    });
    if (existing) return success(res, { analysis: existing });

    const analysis = await aiService.analyzeMeeting(meeting.transcript);

    const [savedAnalysis] = await prisma.$transaction([
      prisma.meetingAnalysis.create({
        data: {
          meetingId: meeting.id,
          summary: analysis.summary,
          actionItems: analysis.actionItems,
          decisions: analysis.decisions,
          followUpSuggestions: analysis.followUpSuggestions,
        },
      }),
      ...analysis.actionItems.map((item) =>
        prisma.actionItem.create({
          data: {
            meetingId: meeting.id,
            task: item.task,
            assignee: item.assignee,
            citations: item.citations || [],
            status: "PENDING",
          },
        })
      ),
    ]);

    return success(res, { analysis: savedAnalysis });
  } catch (err) {
    next(err);
  }
};

export { createMeeting, getMeeting, listMeetings, analyzeMeeting };
