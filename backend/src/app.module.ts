
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PortalModule } from './portal/portal.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PortalModule,
  ],
  providers: [PrismaService],
})
export class AppModule { }
