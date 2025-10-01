import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Department } from './department.entity';

@Entity('company')
export class Company extends AbstractEntity<Company> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  companyCode: string;

  @Column({ unique: true })
  taxCode: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  companyType: string;

  @Column({ nullable: true })
  mainIndustry: string;

  @Column({ nullable: true })
  representativeName: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  joinDate: Date;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  websiteAddress: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  status: string;

  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];
}
