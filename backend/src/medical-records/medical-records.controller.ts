
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { IsString, IsArray, IsOptional, IsUUID, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for Prescription
class PrescriptionDto {
  @IsString()
  medicationName: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

// DTO for Creating Medical Record
class CreateMedicalRecordDto {
  @IsUUID()
  patientId: string;

  @IsString()
  diagnosis: string;

  @IsString()
  symptoms: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionDto)
  prescriptions?: PrescriptionDto[];
}

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) { }

  // Create medical record (Doctor only)
  @Post()
  @Roles(Role.DOCTOR)
  async create(@Request() req, @Body() createDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createDto, req.user.userId);
  }

  // Get all medical records for a patient
  @Get('patient/:patientId')
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findByPatient(patientId);
  }

  // Get single medical record
  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }
}
