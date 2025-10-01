import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveColumnCountryTableCompany1759331593350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('company', 'country');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'country',
      new TableColumn({
        name: 'country',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}
