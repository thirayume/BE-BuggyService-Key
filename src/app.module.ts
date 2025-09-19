import { Module } from '@nestjs/common';
import { CommissionModule } from './commission/commission.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, CommissionModule],
})
export class AppModule {}