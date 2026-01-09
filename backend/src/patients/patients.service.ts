
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get all patients with basic info
   */
  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get single patient with basic details
   */
  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * CRITICAL: Fetches the complete medical history for the "Consultation Mode".
   * - Includes User profile (Name, Email)
   * - Includes MedicalRecords sorted by NEWEST first.
   * - Includes upcoming Appointments.
   */
  async getFullHistory(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        // Fetch all records sorted by date
        medicalRecords: {
          orderBy: {
            visitDate: 'desc',
          },
          include: {
            doctor: {
              select: {
                user: {
                  select: {
                    name: true, // Doctor name who performed the visit
                  },
                },
              },
            },
            prescriptions: true,
          },
        },
        // Fetch upcoming appointments
        appointments: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            },
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          include: {
            doctor: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
                specialization: true,
              },
            },
          },
        }
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Update patient information
   */
  async update(id: string, data: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });
  }
}
