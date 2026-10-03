import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module'
import { OrganizationsModule } from './organizations/organizations.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    // Placeholder modules - add your feature modules here
    // UsersModule,
    OrganizationsModule,
    // BookingsModule,
    // InvoicesModule,
    // NotificationsModule,
  ],
})
export class AppModule {}
