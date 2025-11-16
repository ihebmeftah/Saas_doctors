import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Clinique } from "src/clinique/entities/clinique.entity";

@Entity()
export class Doctor extends User { 
    @ManyToOne(() => Clinique, (clinique) => clinique.doctors)
    clinique: Clinique;
}
