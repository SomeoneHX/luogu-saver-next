import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { BaseEntity } from './base';

@Entity({ name: 'advertisement' })
export class Advertisement extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;

    @Column({ name: 'image_url', type: 'varchar', length: 2048 })
    imageUrl: string;

    @Column({ name: 'alt_text', type: 'varchar', length: 255 })
    altText: string;

    @Column({ name: 'target_url', type: 'varchar', length: 2048, nullable: true })
    targetUrl: string | null;

    @Column({ type: 'tinyint', default: 1 })
    enabled: boolean;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
