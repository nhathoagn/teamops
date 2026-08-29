import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    // Placeholder modules - add your feature modules here
    // AuthModule,
    // UsersModule,
    // OrganizationsModule,
    // BookingsModule,
    // InvoicesModule,
    // NotificationsModule,
  ],
})
export class AppModule {}
