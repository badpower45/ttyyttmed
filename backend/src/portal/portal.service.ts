import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PortalService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate secure access token for patient portal
     */
    async generateAccessToken(patientId: string, expiresInDays: number = 30) {
        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create portal access record
        const portalAccess = await this.prisma.patientPortal.create({
            data: {
                patientId,
                accessToken: token,
                expiresAt,
                isActive: true,
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            token,
            expiresAt,
            portalUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/${token}`,
            patient: portalAccess.patient,
        };
    }

    /**
     * Validate access token and get patient data
     */
    async validateToken(token: string) {
        const portalAccess = await this.prisma.patientPortal.findUnique({
            where: { accessToken: token },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!portalAccess) {
            throw new NotFoundException('Invalid or expired access token');
        }

        // Check if token is still active
        if (!portalAccess.isActive) {
            throw new NotFoundException('Access token has been deactivated');
        }

        // Check if token has expired
        if (portalAccess.expiresAt && new Date() > portalAccess.expiresAt) {
            throw new NotFoundException('Access token has expired');
        }

        return portalAccess.patient;
    }

    /**
     * Get medical records via portal token
     */
    async getRecordsByToken(token: string) {
        const patient = await this.validateToken(token);

        // Get all medical records for this patient
        const records = await this.prisma.medicalRecord.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                prescriptions: true,
            },
            orderBy: {
                visitDate: 'desc',
            },
        });

        return {
            patient: {
                name: patient.user.name,
                email: patient.user.email,
                dateOfBirth: patient.dateOfBirth,
                bloodType: patient.bloodType,
                allergies: patient.allergies,
                chronicDiseases: patient.chronicDiseases,
            },
            records,
        };
    }

    /**
     * Deactivate portal access
     */
    async deactivateToken(token: string) {
        return this.prisma.patientPortal.update({
            where: { accessToken: token },
            data: { isActive: false },
        });
    }
}
