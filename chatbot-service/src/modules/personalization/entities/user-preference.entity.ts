import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_preferences')
@Index(['userId'])
export class UserPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userRole: string;

  @Column({ type: 'int', default: 1 })
  defaultCompanyId: number;

  @Column({ type: 'int', nullable: true })
  defaultWarehouseId: number;

  @Column({ default: 'vi' })
  language: string;

  @Column({ default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  favoriteItems: string[];

  @Column({ type: 'jsonb', nullable: true })
  favoriteWarehouses: string[];

  @Column({ type: 'jsonb', nullable: true })
  notificationPreferences: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  customSettings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
