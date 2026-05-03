import muscleMap from '../../../../../packages/data-definitions/muscle.json' with { type: 'json' };
import exerciseMap from '../../../../../packages/data-definitions/exercise.json' with { type: 'json' };

export async function seed(knex) {
  await knex('exercise_muscle_targets').del();
  await knex('exercises').del();
  await knex('muscles').del();

  const muscles = muscleMap.map((m) => ({
    id: m.id,
    mesh_name: m.mesh_name,
    muscle_group: m.muscle_group,
  }));
  await knex('muscles').insert(muscles);

  const exercises = exerciseMap.map((e) => ({
    exercise_id: e.exercise_id,
    name: e.name,
  }));
  await knex('exercises').insert(exercises);

  const targets = [];
  for (const ex of exerciseMap) {
    for (const muscleId of ex.primary_targets) {
      targets.push({
        exercise_id: ex.exercise_id,
        muscle_id: muscleId,
        target_type: 'primary',
      });
    }
    for (const muscleId of ex.secondary_targets) {
      targets.push({
        exercise_id: ex.exercise_id,
        muscle_id: muscleId,
        target_type: 'secondary',
      });
    }
  }
  await knex('exercise_muscle_targets').insert(targets);
}
