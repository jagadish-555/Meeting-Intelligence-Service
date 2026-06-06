import express from "express";
import auth from "../middleware/auth.js";
import * as ctrl from "../controllers/meetingController.js";

const router = express.Router();

router.use(auth);
/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Create a new meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, participants, meetingDate, transcript]
 *             properties:
 *               title:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               meetingDate:
 *                 type: string
 *                 format: date-time
 *               transcript:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                     speaker:
 *                       type: string
 *                     text:
 *                       type: string
 *     responses:
 *       201:
 *         description: Meeting created
 *       400:
 *         description: Validation error
 */
router.post("/", ctrl.createMeeting);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: List meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of meetings
 */
router.get("/", ctrl.listMeetings);

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: Get a meeting by ID
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 */
router.get("/:id", ctrl.getMeeting);

/**
 * @swagger
 * /api/meetings/{id}/analyze:
 *   post:
 *     summary: Analyze a meeting transcript
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analysis successful
 *       404:
 *         description: Meeting not found
 */
router.post("/:id/analyze", ctrl.analyzeMeeting);

export default router;
