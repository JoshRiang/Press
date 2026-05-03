import { z } from "zod";
import db from "../config/db.js";

const createLogSchema = z.object({
  exercise_id: z.string().min(1, "Exercise ID is required"),
  log_data: z.string().regex(/^\d+x\d+x\d+$/, "Invalid format. Use WeightxSetsxReps (e.g., 30x3x12)"),
});

export const createLog = async (req, res, next) => {
  try {
    const validated = createLogSchema.parse(req.body);

    const [log] = await db("workout_logs")
      .insert({
        user_id: req.user_id,
        exercise_id: validated.exercise_id,
        log_data: validated.log_data,
      })
      .returning(["id", "user_id", "exercise_id", "log_data", "created_at"]);

    res.status(201).json({
      success: true,
      message: "Workout logged successfully",
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserLogs = async (req, res, next) => {
  try {
    const logs = await db("workout_logs").select("workout_logs.id", "workout_logs.log_data", "workout_logs.created_at", "exercises.exercise_id", "exercises.name as exercise_name").join("exercises", "workout_logs.exercise_id", "exercises.exercise_id").where("workout_logs.user_id", req.user_id).orderBy("workout_logs.created_at", "desc");

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = createLogSchema.parse(req.body);

    const log = await db("workout_logs").where("id", id).first();
    if (!log) {
      const err = new Error("Workout log not found");
      err.statusCode = 404;
      throw err;
    }

    if (log.user_id !== req.user_id) {
      const err = new Error("Not authorized to update this log");
      err.statusCode = 403;
      throw err;
    }

    const [updated] = await db("workout_logs")
      .where("id", id)
      .update({
        exercise_id: validated.exercise_id,
        log_data: validated.log_data,
      })
      .returning(["id", "user_id", "exercise_id", "log_data", "created_at"]);

    res.status(200).json({
      success: true,
      message: "Workout log updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await db("workout_logs").where("id", id).first();
    if (!log) {
      const err = new Error("Workout log not found");
      err.statusCode = 404;
      throw err;
    }

    if (log.user_id !== req.user_id) {
      const err = new Error("Not authorized to delete this log");
      err.statusCode = 403;
      throw err;
    }

    await db("workout_logs").where("id", id).del();

    res.status(200).json({
      success: true,
      message: "Workout log deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
