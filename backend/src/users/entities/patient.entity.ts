import { Column, Entity } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Patient extends User {
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  bloodType: string;

  // Ajoutez d'autres champs spécifiques au patient si nécessaire
}