import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Gender } from '@prisma/client';

// DTO for updating patient
class UpdatePatientDto {
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    bloodType?: string;

    @IsOptional()
    allergies?: string[];

    @IsOptional()
    chronicDiseases?: string[];

    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @IsOptional()
    @IsString()
    emergencyPhone?: string;

    @IsOptional()
    @IsString()
    insuranceInfo?: string;
}

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
    constructor(private patientsService: PatientsService) { }

    // Get all patients (Admin/Doctor only)
    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR)
    async findAll() {
        return this.patientsService.findAll();
    }

    // Get patient by ID
    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR)
    async findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id);
    }

    // Get full medical history (for consultation mode)
    @Get(':id/history')
    @Roles(Role.ADMIN, Role.DOCTOR)
    async getFullHistory(@Param('id') id: string) {
        return this.patientsService.getFullHistory(id);
    }

    // Update patient information
    @Put(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
    async update(@Param('id') id: string, @Body() updateDto: UpdatePatientDto) {
        return this.patientsService.update(id, updateDto);
    }
}
