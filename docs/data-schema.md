# Data Schema Overview

This document explains the two core JSON data files used to bootstrap the database and coordinate the 3D visualizer in Three.js.

## 1. muscle.json

This file serves as the master anatomical reference. It maps unique, database-friendly IDs to physical descriptions and the specific object names within the 3D model's hierarchy.

**Key Fields:**

- `id` (Unique Char/String): The primary, human-readable identifier intended for the database. Essential for linking exercises to specific muscle meshes.
- `mesh_name` (String): The exact object name in the Blender/GLTF hierarchy. Used in Three.js to target and color specific muscle parts dynamically.
- `muscle_group` (String): The human-readable name of the muscle group (in Indonesian) for UI display.

## 2. exercise.json

This file contains a predefined list of 100 common gym exercises. It defines which muscle groups (referenced by their unique IDs) are affected by each exercise.

**Key Fields:**

- `exercise_id` (Unique Char/String): The primary identifier for the exercise table in the database.
- `name` (String): The full English name of the exercise.
- `primary_targets` (Array): A list of muscle `id`s (from `muscle.json`) representing the main target muscle group(s).
- `secondary_targets` (Array): A list of muscle `id`s representing synergistic or supporting muscle group(s).

---

**Relational Integrity:**
The values in `primary_targets` and `secondary_targets` within `exercise.json` function as **Foreign Keys**, referencing the unique `id` field within `muscle.json`.

## 3. Relational PostgreSQL Schema (Current)

The backend persists the JSON definitions into normalized relational tables.

### `users`

- `id` (UUID, PK, default `gen_random_uuid()`)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(255), NOT NULL)
- `current_weight` (DECIMAL, NULLABLE)
- `target_weight` (DECIMAL, NULLABLE)
- `height` (DECIMAL, NULLABLE)
- `weight_history` (JSONB, default `[]`)
- `created_at` (TIMESTAMP, default `now()`)

### `muscles`

- `id` (VARCHAR(64), PK)
- `mesh_name` (VARCHAR(255), NOT NULL)
- `muscle_group` (VARCHAR(255), NOT NULL)

### `exercises`

- `exercise_id` (VARCHAR(64), PK)
- `name` (VARCHAR(255), NOT NULL)

### `exercise_muscle_targets`

- `exercise_id` (VARCHAR(64), FK -> `exercises.exercise_id`, ON DELETE CASCADE)
- `muscle_id` (VARCHAR(64), FK -> `muscles.id`, ON DELETE CASCADE)
- `target_type` (VARCHAR(16), NOT NULL, CHECK in `('primary', 'secondary')`)
- Composite PK: (`exercise_id`, `muscle_id`)

### `workout_logs`

- `id` (UUID, PK, default `gen_random_uuid()`)
- `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
- `exercise_id` (VARCHAR(64), FK -> `exercises.exercise_id`, ON DELETE CASCADE)
- `log_data` (VARCHAR(255), NOT NULL) — format: `WeightxSetsxReps` (e.g., `30x3x12`)
- `session_id` (UUID, FK -> `workout_sessions.id`, ON DELETE CASCADE, NULLABLE)
- `created_at` (TIMESTAMP, default `now()`)

### `workout_sessions`

- `id` (UUID, PK, default `gen_random_uuid()`)
- `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
- `title` (VARCHAR(255), NOT NULL)
- `created_at` (TIMESTAMP, default `now()`)

### Relationship Summary

- One exercise can map to many muscles through `exercise_muscle_targets`.
- One muscle can be used by many exercises through `exercise_muscle_targets`.
- `target_type` identifies whether the relation is a primary or secondary target.
- **One workout session can contain many workout logs** (One-to-Many via `session_id`).
- Deleting a session cascades to all its logs.
- `session_id` is nullable to maintain backward compatibility with standalone logs.

