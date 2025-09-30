import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Employee } from './employee.entity';

@Entity('users')
export class User extends AbstractEntity<User> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @OneToOne(() => Employee, (employee) => employee.user)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  status: string;

  @Column({ default: false })
  verified: boolean;
}
