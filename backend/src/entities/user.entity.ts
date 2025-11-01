import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { Vote } from './vote.entity';

@Unique(['email'])
@Unique(['username'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 320, nullable: false })
  email: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  username: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 120, nullable: true })
  displayName: string | null;


  @OneToMany(() => Bookmark, (b) => b.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Vote, (v) => v.user)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}