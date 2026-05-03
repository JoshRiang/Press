export async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.decimal("current_weight", 5, 2).nullable();
    table.decimal("target_weight", 5, 2).nullable();
    table.decimal("height", 5, 2).nullable();
    table.jsonb("weight_history").defaultTo("[]");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("current_weight");
    table.dropColumn("target_weight");
    table.dropColumn("height");
    table.dropColumn("weight_history");
  });
}
