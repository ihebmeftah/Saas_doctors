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

  @Column({ nullable: true })
  cin: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  // Ajoutez d'autres champs spécifiques au patient si nécessaire
}