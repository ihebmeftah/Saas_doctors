import { TimeStamEntity } from 'src/database/timestamp-entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clinic_services')
export class ClinicService extends TimeStamEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 30 })
    durationMinutes: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Clinique, (clinique) => clinique.services, { onDelete: 'CASCADE' })
    clinique: Clinique;
}
