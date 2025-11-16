import { CreateDateColumn, DeleteDateColumn, VersionColumn, UpdateDateColumn, Column } from "typeorm";

export class TimeStamEntity {
    @CreateDateColumn({
        type: Date,
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: Date,
        name: 'updated_at',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: Date,
        name: 'deleted_at',
    })
    deletedAt: Date;

    @VersionColumn()
    version: number;

    @Column({ default: true })
    active: boolean;
}