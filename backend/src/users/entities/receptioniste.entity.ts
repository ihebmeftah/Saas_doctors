import { Entity, PrimaryGeneratedColumn, OneToOne, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Clinique } from "src/clinique/entities/clinique.entity";
@Entity()
export class Receptionist extends User {
    @ManyToOne(() => Clinique, (clinique) => clinique.receptionists)
    clinique: Clinique;
 }
