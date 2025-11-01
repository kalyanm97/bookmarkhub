import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity'; import { Vote } from './vote.entity';
@Entity('bookmarks') export class Bookmark {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 200 }) title!: string;
  @Column() url!: string;
  @ManyToOne(() => User, (u) => u.bookmarks, { onDelete: 'CASCADE', nullable: true }) user!: User | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @OneToMany(() => Vote, (v) => v.bookmark) votes!: Vote[];
}