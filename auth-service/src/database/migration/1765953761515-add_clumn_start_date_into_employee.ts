import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddClumnStartDateIntoEmployee1765953761515 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'employees',
      new TableColumn({
        name: 'start_date',
        type: 'date',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('employess', 'start_date');
  }
}
