import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Company } from './company.entity';
import { Employee } from './employee.entity';

@Entity('departments')
export class Department extends AbstractEntity<Department> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @ManyToOne(() => Company, (company) => company.departments)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ unique: true })
  departmentCode: string;

  @Column({ nullable: true })
  departmentName: string;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
