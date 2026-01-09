import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new medical record (Doctor only)
     */
    async create(data: any, doctorUserId: string) {
        // Find doctor by userId
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });

        if (!doctor) {
            throw new Error('Doctor profile not found');
        }

        // Create medical record with prescriptions
        const { prescriptions, ...recordData } = data;

        const medicalRecord = await this.prisma.medicalRecord.create({
            data: {
                ...recordData,
                doctorId: doctor.id,
                visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
                prescriptions: prescriptions
                    ? {
                        create: prescriptions,
                    }
                    : undefined,
            },
            include: {
                prescriptions: true,
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
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return medicalRecord;
    }

    /**
     * Get all medical records for a patient
     */
    async findByPatient(patientId: string) {
        return this.prisma.medicalRecord.findMany({
            where: { patientId },
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
    }

    /**
     * Get single medical record
     */
    async findOne(id: string) {
        return this.prisma.medicalRecord.findUnique({
            where: { id },
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
                prescriptions: true,
            },
        });
    }
}
