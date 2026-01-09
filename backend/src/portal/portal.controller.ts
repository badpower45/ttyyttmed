import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { IsUUID, IsInt, IsOptional, Min, Max } from 'class-validator';

// DTO for generating access token
class GenerateTokenDto {
    @IsUUID()
    patientId: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(365)
    expiresInDays?: number;
}

@Controller('portal')
export class PortalController {
    constructor(private portalService: PortalService) { }

    // Generate access token (Admin/Doctor only - requires auth)
    @Post('generate-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DOCTOR)
    async generateToken(@Body() dto: GenerateTokenDto) {
        return this.portalService.generateAccessToken(
            dto.patientId,
            dto.expiresInDays || 30,
        );
    }

    // Public endpoint - Get patient info by token (NO AUTH REQUIRED)
    @Get(':token')
    async getPatientByToken(@Param('token') token: string) {
        return this.portalService.validateToken(token);
    }

    // Public endpoint - Get medical records by token (NO AUTH REQUIRED)
    @Get(':token/records')
    async getRecordsByToken(@Param('token') token: string) {
        return this.portalService.getRecordsByToken(token);
    }

    // Deactivate token (Admin/Doctor only - requires auth)
    @Post(':token/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DOCTOR)
    async deactivateToken(@Param('token') token: string) {
        return this.portalService.deactivateToken(token);
    }
}
