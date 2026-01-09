import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [MedicalRecordsController],
    providers: [MedicalRecordsService, PrismaService],
    exports: [MedicalRecordsService],
})
export class MedicalRecordsModule { }
