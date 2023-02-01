import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'videos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('description', 'longtext').nullable().alter()
      table.integer('likes').unsigned().defaultTo(0)
      table.integer('dislikes').unsigned().defaultTo(0)
      table.integer('views').unsigned().defaultTo(0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('likes')
      table.dropColumn('dislike')
      table.dropColumn('views')
    })
  }
}
