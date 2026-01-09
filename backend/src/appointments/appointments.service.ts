import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create new appointment
     */
    async create(data: any) {
        return this.prisma.appointment.create({
            data: {
                ...data,
                date: new Date(data.date),
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
    }

    /**
     * Get all appointments (filtered by role)
     */
    async findAll(userId: string, userRole: string) {
        const where: any = {};

        // If doctor, show their appointments only
        if (userRole === 'DOCTOR') {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId },
            });
            if (doctor) {
                where.doctorId = doctor.id;
            }
        }

        // If patient, show their appointments only
        if (userRole === 'PATIENT') {
            const patient = await this.prisma.patient.findUnique({
                where: { userId },
            });
            if (patient) {
                where.patientId = patient.id;
            }
        }

        return this.prisma.appointment.findMany({
            where,
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
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                        specialization: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    /**
     * Get single appointment
     */
    async findOne(id: string) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
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

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        return appointment;
    }

    /**
     * Update appointment status
     */
    async updateStatus(id: string, status: AppointmentStatus) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        return this.prisma.appointment.update({
            where: { id },
            data: { status },
        });
    }
}
