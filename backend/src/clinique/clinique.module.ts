import { Module } from '@nestjs/common';
import { CliniqueService } from './clinique.service';
import { CliniqueController } from './clinique.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinique } from './entities/clinique.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clinique]),
    UsersModule,
  ],
  controllers: [CliniqueController],
  providers: [CliniqueService],
  exports: [CliniqueService],
})
export class CliniqueModule { }
