import { Gender } from 'src/common/enums/employee.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Department } from './department.entity';
import { User } from './user.entity';

@Entity('employees')
export class Employee extends AbstractEntity<Employee> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  employeeCode: string;

  @Column({ nullable: true })
  employeeName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  status: string;

  @Column()
  startDate: Date;

  @OneToOne(() => User, (user) => user.employee)
  user: User;
}
