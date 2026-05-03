import db from '../config/db.js';

export const getAllExercises = async (_req, res, next) => {
  try {
    const rows = await db('exercises')
      .select(
        'exercises.exercise_id',
        'exercises.name',
        'exercise_muscle_targets.target_type',
        'muscles.id as muscle_id',
        'muscles.mesh_name',
        'muscles.muscle_group'
      )
      .leftJoin('exercise_muscle_targets', 'exercises.exercise_id', 'exercise_muscle_targets.exercise_id')
      .leftJoin('muscles', 'exercise_muscle_targets.muscle_id', 'muscles.id')
      .orderBy('exercises.name');

    const exercisesMap = new Map();

    for (const row of rows) {
      if (!exercisesMap.has(row.exercise_id)) {
        exercisesMap.set(row.exercise_id, {
          exercise_id: row.exercise_id,
          name: row.name,
          primary_targets: [],
          secondary_targets: [],
        });
      }

      const exercise = exercisesMap.get(row.exercise_id);
      if (row.target_type === 'primary') {
        exercise.primary_targets.push({
          muscle_id: row.muscle_id,
          mesh_name: row.mesh_name,
          muscle_group: row.muscle_group,
        });
      } else if (row.target_type === 'secondary') {
        exercise.secondary_targets.push({
          muscle_id: row.muscle_id,
          mesh_name: row.mesh_name,
          muscle_group: row.muscle_group,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(exercisesMap.values()),
    });
  } catch (err) {
    next(err);
  }
};
