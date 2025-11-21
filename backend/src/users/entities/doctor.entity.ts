import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./user.entity";
import { Clinique } from "src/clinique/entities/clinique.entity";

@Entity()
export class Doctor extends User {
    @Column({ nullable: true })
    speciality: string;

    @ManyToOne(() => Clinique, (clinique) => clinique.doctors)
    clinique: Clinique;
}
