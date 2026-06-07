import { z } from "zod";
import prisma from "../config/db.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { success } from "../utils/response.js";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

const createSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID").optional(),
  task: z.string().min(1, "Task is required"),
  assignee: z.string().email("Invalid assignee email"),
  dueDate: z.string().datetime("Invalid due date").optional(),
  citations: z.array(z.object({ timestamp: z.string() })).optional(),
});

const createActionItem = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg =
        parsed.error?.issues?.[0]?.message ||
        parsed.error?.errors?.[0]?.message ||
        "Validation Error";
      throw new ValidationError(errorMsg);
    }

    const { meetingId, task, assignee, dueDate, citations } = parsed.data;

    const actionItem = await prisma.actionItem.create({
      data: {
        meetingId: meetingId || null,
        task,
        assignee,
        dueDate: dueDate ? new Date(dueDate) : null,
        citations: citations || [],
        status: "PENDING",
      },
    });

    return success(res, { actionItem }, 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ValidationError(
        `Status must be one of: ${VALID_STATUSES.join(", ")}`
      );
    }

    const existing = await prisma.actionItem.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new NotFoundError("Action item");

    const actionItem = await prisma.actionItem.update({
      where: { id: req.params.id },
      data: { status },
    });

    return success(res, { actionItem });
  } catch (err) {
    next(err);
  }
};

const listActionItems = async (req, res, next) => {
  try {
    const { status, assignee, meetingId, page = 1, limit = 10 } = req.query;

    if (status && !VALID_STATUSES.includes(status)) {
      throw new ValidationError("Invalid status filter");
    }

    const where = {};
    if (status) where.status = status;
    if (assignee) where.assignee = assignee;
    if (meetingId) where.meetingId = meetingId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, actionItems] = await prisma.$transaction([
      prisma.actionItem.count({ where }),
      prisma.actionItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return success(res, {
      actionItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOverdueItems = async (req, res, next) => {
  try {
    const actionItems = await prisma.actionItem.findMany({
      where: {
        status: { not: "COMPLETED" },
        dueDate: {
          not: null,
          lt: new Date(),
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return success(res, { actionItems });
  } catch (err) {
    next(err);
  }
};

export { createActionItem, updateStatus, listActionItems, getOverdueItems };
