import { TimeStamEntity } from 'src/database/timestamp-entity';
import { Patient } from 'src/users/entities/patient.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Rdv } from 'src/rdv/entities/rdv.entity';
import { Payment } from 'src/payment/entities/payment.entity';

export enum FacturationStatus {
    DRAFT = 'draft',
    ISSUED = 'issued',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

@Entity('facturation')
export class Facturation extends TimeStamEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    invoiceNumber: string;

    @ManyToOne(() => Patient, { eager: true })
    patient: Patient;

    @ManyToOne(() => Clinique, { eager: true })
    clinique: Clinique;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    paidAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    taxAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountAmount: number;

    @Column('enum', { enum: FacturationStatus, default: FacturationStatus.ISSUED })
    status: FacturationStatus;

    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToOne(() => Rdv, (rdv) => rdv.facturation, { nullable: true })
    @JoinColumn()
    rdv: Rdv;

    @OneToMany(() => Payment, (payment) => payment.facturation, { cascade: true })
    payments: Payment[];

    // Computed field
    get remainingAmount(): number {
        return Number(this.totalAmount) - Number(this.paidAmount);
    }
}
