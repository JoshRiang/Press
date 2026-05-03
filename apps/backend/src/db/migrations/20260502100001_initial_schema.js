export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.string("full_name", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("muscles", (table) => {
    table.string("id", 64).primary();
    table.string("mesh_name", 255).notNullable();
    table.string("muscle_group", 255).notNullable();
  });

  await knex.schema.createTable("exercises", (table) => {
    table.string("exercise_id", 64).primary();
    table.string("name", 255).notNullable();
  });

  await knex.schema.createTable("exercise_muscle_targets", (table) => {
    table.string("exercise_id", 64).notNullable().references("exercise_id").inTable("exercises").onDelete("CASCADE");
    table.string("muscle_id", 64).notNullable().references("id").inTable("muscles").onDelete("CASCADE");
    table.string("target_type", 16).notNullable();
    table.primary(["exercise_id", "muscle_id"]);
    table.check("target_type in ('primary', 'secondary')");
  });

  await knex.schema.createTable("workout_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("exercise_id", 64).notNullable().references("exercise_id").inTable("exercises").onDelete("CASCADE");
    table.string("log_data", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("workout_logs");
  await knex.schema.dropTableIfExists("exercise_muscle_targets");
  await knex.schema.dropTableIfExists("exercises");
  await knex.schema.dropTableIfExists("muscles");
  await knex.schema.dropTableIfExists("users");
}
