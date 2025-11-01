import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity'; import { Bookmark } from './bookmark.entity';
@Entity('votes') export class Vote {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' }) userId!: string;
  @PrimaryColumn({ name: 'bookmark_id', type: 'uuid' }) bookmarkId!: string;
  @Column({ type: 'smallint' }) value!: -1 | 1;
  @ManyToOne(() => User, (u) => u.votes, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user!: User;
  @ManyToOne(() => Bookmark, (b) => b.votes, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'bookmark_id' }) bookmark!: Bookmark;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}