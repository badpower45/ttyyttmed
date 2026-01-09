/**
 * PRISMA SCHEMA REFERENCE
 * 
 * model User {
 *   id        String   @id @default(uuid())
 *   email     String   @unique
 *   role      Role     @default(PATIENT)
 *   name      String
 * }
 * 
 * model Patient {
 *   id             String   @id @default(uuid())
 *   userId         String   @unique
 *   dateOfBirth    DateTime
 *   bloodType      String?
 *   chronicDiseases String[]
 *   allergies      String[]
 *   appointments   Appointment[]
 *   records        MedicalRecord[]
 * }
 * 
 * model Appointment {
 *   id        String   @id @default(uuid())
 *   patientId String
 *   doctorId  String
 *   date      DateTime
 *   status    AppointmentStatus
 * }
 * 
 * model MedicalRecord {
 *   id             String   @id @default(uuid())
 *   patientId      String
 *   doctorId       String
 *   visitDate      DateTime @default(now())
 *   chiefComplaint String
 *   diagnosis      String
 *   treatmentPlan  String
 *   prescription   Json 
 *   attachments    String[]
 *   notes          String?
 * }
 */

export enum Role {
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST',
  PATIENT = 'PATIENT'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string; // Added for simpler notes
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Patient {
  id: string;
  userId: string; // Link to User
  name: string; // Denormalized for frontend ease
  age: number;
  gender: string;
  bloodType: string;
  chronicDiseases: string[];
  allergies: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string; // Denormalized
  date: string; // ISO String
  time: string;
  type: 'General' | 'Follow-up' | 'Emergency';
  status: AppointmentStatus;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  prescription: Medicine[];
  attachments: string[];
  notes: string;
}