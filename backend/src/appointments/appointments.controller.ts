import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, AppointmentStatus } from '@prisma/client';
import { IsString, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

// DTO for creating appointment
class CreateAppointmentDto {
    @IsUUID()
    patientId: string;

    @IsUUID()
    doctorId: string;

    @IsDateString()
    date: string;

    @IsString()
    timeSlot: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

// DTO for updating appointment status
class UpdateAppointmentStatusDto {
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus;
}

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
    constructor(private appointmentsService: AppointmentsService) { }

    // Create appointment
    @Post()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
    async create(@Body() createDto: CreateAppointmentDto) {
        return this.appointmentsService.create(createDto);
    }

    // Get all appointments (filtered by role)
    @Get()
    @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
    async findAll(@Request() req) {
        return this.appointmentsService.findAll(req.user.userId, req.user.role);
    }

    // Get single appointment
    @Get(':id')
    @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
    async findOne(@Param('id') id: string) {
        return this.appointmentsService.findOne(id);
    }

    // Update appointment status
    @Patch(':id/status')
    @Roles(Role.ADMIN, Role.DOCTOR)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateAppointmentStatusDto,
    ) {
        return this.appointmentsService.updateStatus(id, updateDto.status);
    }
}
