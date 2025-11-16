import { Module } from '@nestjs/common';
import { RdvService } from './rdv.service';
import { RdvController } from './rdv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rdv } from './entities/rdv.entity';
import { UsersModule } from 'src/users/users.module';
import { CliniqueModule } from 'src/clinique/clinique.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rdv]), UsersModule , CliniqueModule],
  controllers: [RdvController],
  providers: [RdvService],
})
export class RdvModule { }
