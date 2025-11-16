import { TimeStamEntity } from 'src/database/timestamp-entity';
import { Facturation } from 'src/facturation/entities/facturation.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentMethod {
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    CHECK = 'check',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment extends TimeStamEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    transactionId: string;

    @ManyToOne(() => Facturation, (facturation) => facturation.payments, { onDelete: 'CASCADE', eager: true })
    facturation: Facturation;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column('enum', { enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Column('enum', { enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ nullable: true })
    reference: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ nullable: true })
    receiptUrl: string;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    refundedAt: Date;

    // Helper method to access RDV through Facturation
    getRdv() {
        return this.facturation?.rdv;
    }
}
