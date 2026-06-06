import express from "express";
import auth from "../middleware/auth.js";
import * as ctrl from "../controllers/actionItemController.js";

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/action-items/overdue:
 *   get:
 *     summary: Get overdue action items
 *     tags: [ActionItems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue items
 */
router.get("/overdue", ctrl.getOverdueItems);

/**
 * @swagger
 * /api/action-items:
 *   post:
 *     summary: Create an action item
 *     tags: [ActionItems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [task, assignee]
 *             properties:
 *               task:
 *                 type: string
 *               assignee:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               meetingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Action item created
 *       400:
 *         description: Validation error
 */
router.post("/", ctrl.createActionItem);

/**
 * @swagger
 * /api/action-items:
 *   get:
 *     summary: List action items
 *     tags: [ActionItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: meetingId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of action items
 */
router.get("/", ctrl.listActionItems);

/**
 * @swagger
 * /api/action-items/{id}/status:
 *   patch:
 *     summary: Update action item status
 *     tags: [ActionItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Validation error
 */
router.patch("/:id/status", ctrl.updateStatus);

export default router;
