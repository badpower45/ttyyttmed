
import { Appointment, AppointmentStatus, MedicalRecord, Patient, Role, User } from '../types';

// --- Mock Database for Single Doctor Clinic ---

export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'doctor@clinic.com', role: Role.DOCTOR, name: 'د. محمد بكري' },
  { id: 'u_sec', email: 'admin@clinic.com', role: Role.RECEPTIONIST, name: 'السكرتارية' },
  { id: 'u2', email: 'john.doe@gmail.com', role: Role.PATIENT, name: 'أحمد محمد' },
  { id: 'u3', email: 'alice.w@gmail.com', role: Role.PATIENT, name: 'منى السيد' },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    userId: 'u2',
    name: 'أحمد محمد',
    age: 45,
    gender: 'ذكر',
    bloodType: 'O+',
    chronicDiseases: ['ضغط الدم'],
    allergies: ['البنسلين'],
  },
  {
    id: 'p2',
    userId: 'u3',
    name: 'منى السيد',
    age: 28,
    gender: 'أنثى',
    bloodType: 'A-',
    chronicDiseases: [],
    allergies: ['الفول السوداني', 'الغبار'],
  },
  {
    id: 'p3',
    userId: 'guest',
    name: 'محمود علي',
    age: 62,
    gender: 'ذكر',
    bloodType: 'B+',
    chronicDiseases: ['سكري النوع الثاني'],
    allergies: [],
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'u1',
    patientName: 'أحمد محمد',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    type: 'General',
    status: AppointmentStatus.CONFIRMED,
  },
  {
    id: 'a2',
    patientId: 'p2',
    doctorId: 'u1',
    patientName: 'منى السيد',
    date: new Date().toISOString().split('T')[0],
    time: '10:15',
    type: 'Follow-up',
    status: AppointmentStatus.PENDING,
  },
  {
    id: 'a3',
    patientId: 'p3',
    doctorId: 'u1',
    patientName: 'محمود علي',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    type: 'General',
    status: AppointmentStatus.CONFIRMED,
  },
  {
    id: 'a4',
    patientId: 'p1',
    doctorId: 'u1',
    patientName: 'أحمد محمد',
    date: '2023-10-25', // Past
    time: '14:00',
    type: 'Emergency',
    status: AppointmentStatus.COMPLETED,
  }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'r1',
    patientId: 'p1',
    doctorId: 'u1',
    visitDate: '2023-10-25',
    chiefComplaint: 'صداع شديد ودوخة',
    diagnosis: 'صداع نصفي',
    treatmentPlan: 'راحة تامة في غرفة مظلمة',
    prescription: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'عند اللزوم', duration: '5 ايام' },
      { name: 'Panadol', dosage: '500mg', frequency: 'كل 6 ساعات', duration: '3 ايام' }
    ],
    attachments: [],
    notes: 'المريض يعاني من ضغوط في العمل.',
  },
  {
    id: 'r2',
    patientId: 'p1',
    doctorId: 'u1',
    visitDate: '2023-08-12',
    chiefComplaint: 'فحص دوري',
    diagnosis: 'ارتفاع ضغط الدم',
    treatmentPlan: 'تظبيط الأكل وتقليل الأملاح',
    prescription: [
      { name: 'Concor', dosage: '5mg', frequency: 'مرة يومياً', duration: 'شهر' }
    ],
    attachments: ['https://picsum.photos/200/300'],
    notes: 'الضغط كان 150/95',
  }
];

// --- Simulated Server Actions ---

export const fetchStats = async () => {
  return {
    todayAppointments: MOCK_APPOINTMENTS.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    pendingRequest: MOCK_APPOINTMENTS.filter(a => a.status === AppointmentStatus.PENDING).length,
    completedToday: MOCK_APPOINTMENTS.filter(a => a.status === AppointmentStatus.COMPLETED || (a.status === AppointmentStatus.CONFIRMED && a.date < new Date().toISOString().split('T')[0])).length,
  };
};

export const getPatientHistory = async (patientId: string) => {
  return MOCK_RECORDS.filter(r => r.patientId === patientId).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
};

export const getPatientDetails = async (patientId: string) => {
  return MOCK_PATIENTS.find(p => p.id === patientId);
};

export const saveMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
  const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
  MOCK_RECORDS.unshift(newRecord);
  return newRecord;
};

export const createPatient = async (data: Omit<Patient, 'id' | 'userId'>) => {
    const newPatient: Patient = {
        id: 'p' + Math.random().toString(36).substr(2, 5),
        userId: 'guest',
        ...data
    };
    MOCK_PATIENTS.push(newPatient);
    return newPatient;
}

export const bookAppointment = async (data: { name: string; email: string; date: string; time: string; doctorId: string; type: string }) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newAppt: Appointment = {
    id: Math.random().toString(36).substr(2, 9),
    patientId: 'new-guest', // In real app, would create user/patient first
    doctorId: 'u1', // Always Dr. Bakry
    patientName: data.name,
    date: data.date,
    time: data.time,
    type: data.type as 'General' | 'Follow-up' | 'Emergency',
    status: AppointmentStatus.PENDING
  };
  
  MOCK_APPOINTMENTS.push(newAppt);
  return newAppt;
};