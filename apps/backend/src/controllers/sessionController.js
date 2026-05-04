import { z } from "zod";
import db from "../config/db.js";

// Zod Schemas

const createSessionSchema = z.object({
  title: z.string().min(1, "Session title is required").max(255),
});

const addSessionLogSchema = z.object({
  exercise_id: z.string().min(1, "Exercise ID is required"),
  log_data: z
    .string()
    .regex(
      /^\d+([.,]\d+)?x\d+([.,]\d+)?x\d+([.,]\d+)?$/,
      "Invalid format. Use WeightxSetsxReps (e.g., 30x3x12 or 32.5x3x12)"
    ),
});

// Helpers Functions 
//  * Parse a log_data string like "30x3x12" into its numerical volume.
//  * Volume = weight × sets × reps
 
function calculateVolume(logData) {
  const parts = logData.replace(/,/g, ".").split("x").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  const [weight, sets, reps] = parts;
  return weight * sets * reps;
}

// Controllers 
/**
 * POST /sessions
 * Creates a new workout session for the authenticated user.
 */
export const createSession = async (req, res, next) => {
  try {
    const validated = createSessionSchema.parse(req.body);

    const [session] = await db("workout_sessions")
      .insert({
        user_id: req.user_id,
        title: validated.title,
      })
      .returning(["id", "user_id", "title", "created_at"]);

    res.status(201).json({
      success: true,
      message: "Session started",
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /sessions
 * Returns all sessions for the authenticated user with nested workout logs
 * and a calculated total_volume per session.
*/
export const getUserSessions = async (req, res, next) => {
  try {
    // Fetch sessions owned by the user
    const sessions = await db("workout_sessions")
      .where("user_id", req.user_id)
      .orderBy("created_at", "desc")
      .select("id", "user_id", "title", "created_at");

    if (sessions.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const sessionIds = sessions.map((s) => s.id);

    // Fetch all logs that belong to these sessions, joining exercise name
    const logs = await db("workout_logs")
      .select(
        "workout_logs.id",
        "workout_logs.session_id",
        "workout_logs.exercise_id",
        "workout_logs.log_data",
        "workout_logs.created_at",
        "exercises.name as exercise_name"
      )
      .join("exercises", "workout_logs.exercise_id", "exercises.exercise_id")
      .whereIn("workout_logs.session_id", sessionIds)
      .orderBy("workout_logs.created_at", "asc");

    // Group logs by session_id and compute total_volume
    const logsBySession = {};
    for (const log of logs) {
      if (!logsBySession[log.session_id]) {
        logsBySession[log.session_id] = [];
      }
      logsBySession[log.session_id].push(log);
    }

    const data = sessions.map((session) => {
      const sessionLogs = logsBySession[session.id] || [];
      const total_volume = sessionLogs.reduce(
        (sum, log) => sum + calculateVolume(log.log_data),
        0
      );
      return { ...session, logs: sessionLogs, total_volume };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /sessions/:id/logs
 * Adds a workout log entry to a specific session.
 */
export const addLogToSession = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;
    const validated = addSessionLogSchema.parse(req.body);

    // Verify session exists and belongs to user
    const session = await db("workout_sessions")
      .where("id", sessionId)
      .first();

    if (!session) {
      const err = new Error("Session not found");
      err.statusCode = 404;
      throw err;
    }

    if (session.user_id !== req.user_id) {
      const err = new Error("Not authorized to add logs to this session");
      err.statusCode = 403;
      throw err;
    }

    const [log] = await db("workout_logs")
      .insert({
        user_id: req.user_id,
        exercise_id: validated.exercise_id,
        log_data: validated.log_data,
        session_id: sessionId,
      })
      .returning([
        "id",
        "user_id",
        "exercise_id",
        "log_data",
        "session_id",
        "created_at",
      ]);

    res.status(201).json({
      success: true,
      message: "Log added to session",
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /sessions/:id
 * Deletes a session and cascades to its logs.
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await db("workout_sessions").where("id", id).first();
    if (!session) {
      const err = new Error("Session not found");
      err.statusCode = 404;
      throw err;
    }

    if (session.user_id !== req.user_id) {
      const err = new Error("Not authorized to delete this session");
      err.statusCode = 403;
      throw err;
    }

    await db("workout_sessions").where("id", id).del();

    res.status(200).json({
      success: true,
      message: "Session deleted",
    });
  } catch (err) {
    next(err);
  }
};
