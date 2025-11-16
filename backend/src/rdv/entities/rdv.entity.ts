import { Clinique } from "src/clinique/entities/clinique.entity";
import { TimeStamEntity } from "src/database/timestamp-entity";
import { Facturation } from "src/facturation/entities/facturation.entity";
import { Doctor } from "src/users/entities/doctor.entity";
import { Patient } from "src/users/entities/patient.entity";
import { Receptionist } from "src/users/entities/receptioniste.entity";
import { userRole } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
export enum rdvStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}
interface Consultation {
    examination: string;
    diagnosis?: string;
    treatment?: string;
}
@Entity()
export class Rdv extends TimeStamEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ManyToOne(() => Patient)
    patient: Patient;
    @ManyToOne(() => Doctor)
    doctor: Doctor;
    @ManyToOne(() => Clinique)
    clinique: Clinique;
    @ManyToOne(() => Receptionist, { nullable: true })
    receptionist: Receptionist;
    @Column()
    reason: string;
    @Column({
        type: 'enum',
        enum: userRole,
        default: userRole.RECEP,
    })
    createdBy: userRole;
    @Column({
        default: 25,
    })
    amount: number;
    @Column({ type: 'timestamp' })
    rdvDate: Date;
    @Column({
        type: 'enum',
        enum: rdvStatus,
        default: rdvStatus.PENDING,
    })
    status: rdvStatus;
    @Column({ type: 'json', nullable: true })
    consultation: Consultation;
    @OneToOne(() => Facturation, (facturation) => facturation.rdv, { nullable: true })
    facturation: Facturation;
}
