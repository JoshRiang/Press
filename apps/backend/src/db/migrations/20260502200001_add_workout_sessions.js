/**
 * Migration: Add workout_sessions table and link workout_logs.
 *
 * Creates a One-to-Many relationship:
 *   workout_sessions (1) ──► (N) workout_logs
 *
 * session_id on workout_logs is NULLABLE so existing rows are unaffected.
 */
export async function up(knex) {
  // 1. Create the parent table
  await knex.schema.createTable("workout_sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 2. Add session_id FK to workout_logs
  await knex.schema.alterTable("workout_logs", (table) => {
    table
      .uuid("session_id")
      .nullable()
      .references("id")
      .inTable("workout_sessions")
      .onDelete("CASCADE");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("workout_logs", (table) => {
    table.dropColumn("session_id");
  });
  await knex.schema.dropTableIfExists("workout_sessions");
}
