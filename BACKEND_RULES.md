# MediCore CMS - Backend Development Rules

## 📋 القواعد العامة للباك اند

### 1. هيكلة المشروع (Project Structure)

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── prisma/
│   │   └── prisma.service.ts  # Database service
│   ├── auth/                  # Authentication module
│   ├── patients/              # Patients module
│   ├── appointments/          # Appointments module
│   ├── medical-records/       # Medical records module
│   └── portal/                # Patient portal module
├── package.json
└── tsconfig.json
```

### 2. معايير التسمية (Naming Conventions)

- **Modules**: استخدم صيغة `kebab-case` مثل `auth`, `patients`, `medical-records`
- **Controllers**: `EntityController` مثل `PatientsController`
- **Services**: `EntityService` مثل `PatientsService`
- **DTOs**: `ActionEntityDto` مثل `CreateMedicalRecordDto`
- **Guards**: `PascalCaseGuard` مثل `JwtAuthGuard`, `RolesGuard`

### 3. قواعد الأمان (Security Rules)

#### Authentication
- ✅ استخدم JWT للـAuthentication
- ✅ Hash passwords باستخدام bcrypt (salt rounds = 10)
- ✅ Expiry token بعد 7 أيام
- ❌ لا تخزن passwords بدون hashing
- ❌ لا تعرض password في responses

#### Authorization
- ✅ استخدم Role-based access control (RBAC)
- ✅ Roles: `PATIENT`, `DOCTOR`, `ADMIN`
- ✅ استخدم `@Roles()` decorator
- ✅ استخدم `JwtAuthGuard` و `RolesGuard` معاً
- ❌ لا تسمح بالوصول للبيانات الحساسة بدون authorization

#### API Endpoints
```typescript
// ✅ صحيح - Protected endpoint
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR, Role.ADMIN)
async findAll() { ... }

// ❌ خطأ - No guards
@Get()
async findAll() { ... }
```

### 4. قواعد Database (Database Rules)

#### Prisma Models
- ✅ استخدم UUIDs للـIDs: `@id @default(uuid())`
- ✅ أضف `createdAt` و `updatedAt` لكل model
- ✅ استخدم Enums للـstatus fields
- ✅ أضف indexes للـforeign keys
- ✅ استخدم `onDelete: Cascade` للـrelations الضرورية

```prisma
// ✅ صحيح
model Patient {
  id        String   @id @default(uuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

#### Prisma Queries
- ✅ استخدم `include` لتحميل البيانات المرتبطة
- ✅ استخدم `select` لتحديد الحقول المطلوبة فقط
- ✅ أضف `orderBy` للنتائج
- ❌ لا تحمل بيانات غير ضرورية

```typescript
// ✅ صحيح
await this.prisma.patient.findMany({
  select: {
    id: true,
    user: {
      select: { name: true, email: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### 5. قواعد API Design

#### RESTful Routes
```
POST   /api/auth/register        # Register
POST   /api/auth/login           # Login
GET    /api/auth/profile         # Get profile

GET    /api/patients             # List patients (admin/doctor)
GET    /api/patients/:id         # Get patient
GET    /api/patients/:id/history # Full medical history
PUT    /api/patients/:id         # Update patient

POST   /api/appointments         # Create appointment
GET    /api/appointments         # List appointments (filtered by role)
GET    /api/appointments/:id     # Get appointment
PATCH  /api/appointments/:id/status  # Update status

POST   /api/medical-records      # Create record (doctor only)
GET    /api/medical-records/patient/:patientId  # Get patient records
GET    /api/medical-records/:id  # Get single record

POST   /api/portal/generate-token    # Generate portal token
GET    /api/portal/:token            # Get patient by token (public)
GET    /api/portal/:token/records    # Get records by token (public)
```

#### Response Format
```typescript
// ✅ Success Response
{
  "data": { ... },
  "message": "Success"
}

// ✅ Error Response
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### 6. قواعد DTOs والـValidation

```typescript
// ✅ صحيح - استخدم decorators
class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### 7. قواعد Error Handling

```typescript
// ✅ صحيح
if (!patient) {
  throw new NotFoundException(`Patient with ID ${id} not found`);
}

if (existingUser) {
  throw new ConflictException('User with this email already exists');
}

if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid credentials');
}
```

### 8. قواعد Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-api-key"

# Optional
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

### 9. قواعد الـDeployment على Vercel

#### Files المطلوبة
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.vercelignore` - Files to ignore
- ✅ `backend/package.json` - Backend dependencies

#### Environment Variables على Vercel
```bash
# في Vercel Dashboard
DATABASE_URL = @database_url (Secret)
JWT_SECRET = @jwt_secret (Secret)
GEMINI_API_KEY = @gemini_api_key (Secret)
FRONTEND_URL = https://your-domain.vercel.app
```

### 10. Best Practices

#### Services
- ✅ Logic الأساسية تكون في Services
- ✅ Controllers تستدعي Services فقط
- ✅ استخدم transactions للعمليات المعقدة

#### Code Organization
- ✅ module واحد لكل feature
- ✅ كل module فيه controller + service + module file
- ✅ DTOs في نفس ملف الـcontroller
- ✅ Types و Enums من `@prisma/client`

#### Performance
- ✅ استخدم indexes في database
- ✅ حمل البيانات المطلوبة فقط
- ✅ استخدم pagination للقوائم الطويلة
- ✅ Cache البيانات الثابتة

---

## 🚀 Development Workflow

### 1. Setup
```bash
# Install dependencies
npm install
cd backend && npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 2. Development
```bash
# Run frontend
npm run dev

# Run backend
npm run backend:dev
```

### 3. Deployment
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 📝 تذكير دائم

1. **Always validate input** باستخدام class-validator
2. **Always use guards** لحماية الـendpoints
3. **Always handle errors** بشكل صحيح
4. **Always include relations** في الـPrisma queries المطلوبة
5. **Never expose sensitive data** في الـresponses
6. **Always use transactions** للعمليات المعقدة
7. **Always add indexes** للـforeign keys
8. **Always check permissions** قبل أي عملية

---

هذه القواعد يجب اتباعها في كل مرة تعمل فيها على الباك اند! 🎯
