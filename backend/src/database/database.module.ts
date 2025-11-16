import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ pour éviter de réimporter ConfigModule partout
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('POSTGRES_HOST');
        const port = parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10);
        const username = configService.get<string>('POSTGRES_USER');
        const password = configService.get<string>('POSTGRES_PASSWORD');
        const database = configService.get<string>('POSTGRES_DB');

        console.log('🧠 Connexion DB :', { host, port, username, password, database });

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true, // 🔥 charge automatiquement Appointment
          synchronize: true,      // recrée les tables si besoin
          // logging: true,          // optionnel pour voir les requêtes SQL
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
