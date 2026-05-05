export async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.decimal("weight_increment", 5, 2).defaultTo(2.5);
    table.integer("rep_threshold").defaultTo(10);
    table.decimal("volume_overload", 5, 2).defaultTo(5.0);
  });
}

export async function down(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("weight_increment");
    table.dropColumn("rep_threshold");
    table.dropColumn("volume_overload");
  });
}
