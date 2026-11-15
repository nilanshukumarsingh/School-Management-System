# ScholaVerse — Cloud School Management & Academic Operations System
**Author:** Nilanshu Kumar Singh  
**Repository:** [https://github.com/nilanshukumarsingh/School-Management-System.git](https://github.com/nilanshukumarsingh/School-Management-System.git)  

---

## 1. Project Overview
**ScholaVerse** is a modern, responsive, role-based School Management Platform engineered to streamline the day-to-day operations of educational institutions. It features three strictly segregated operational portals for **Administrators**, **Teachers**, and **Guardians**, underpinned by a resilient RESTful API and a structured MongoDB data model.

### 🌟 Key Highlights
- **Role-Based Portals**: Dedicated workspaces for Admin, Teacher, and Guardian with server-side authorization guards.
- **5 Core Business Workflows & Data Integrity Guarantees**:
  1. Teachers can access only assigned classes and record attendance.
  2. Duplicate attendance for the same student/session is rejected via unique compound indexes or safely updated.
  3. Examination marks and configurable grading rules automatically calculate totals, percentages, letter grades ($A+, A, B, C, D, F$), GPA, and report cards.
  4. Guardians can only access their linked children's records (strict privacy isolation).
  5. Fee ledger reconciliation ensures paid and due amounts match transactional payment records, with duplicate submission prevention.
- **Interactive OpenAPI/Swagger Documentation**: Mounted at `/api-docs` on the backend.
- **Comprehensive Automated Test Suite**: 16 Jest & Supertest integration tests covering all critical workflows and negative edge cases.
- **Modern SaaS Interface**: Clean typography, collapsible sidebar, interactive Recharts visualizations, accessible data tables, search/filter/pagination, and public landing page with playful cartoon illustrations.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js (Vite 6)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS & PostCSS
- **Navigation**: React Router DOM (v6)
- **HTTP Client**: Axios with centralized request/response interceptors
- **Icons**: Lucide React
- **Analytics Charts**: Recharts

### Backend
- **Runtime**: Node.js (v24 LTS compatible)
- **Web Framework**: Express.js (v4)
- **Security & Middleware**: Helmet, CORS, Morgan, JWT (`jsonwebtoken`), bcryptjs
- **API Documentation**: OpenAPI 3.0 / Swagger UI Express (`/api-docs`)
- **Validation**: Zod schema parsing and custom parameter validators

### Database & Persistence
- **Database**: MongoDB (Local or MongoDB Atlas free tier)
- **ODM**: Mongoose (v8) with compound unique indexes and strict schema validation

### Automated Testing
- **Testing Runner**: Jest
- **Integration HTTP Testing**: Supertest

---

## 3. Demo Credentials

The system includes pre-seeded demo accounts for each role. You can log in using these credentials or click the **1-Click Demo Login** buttons on the landing page:

| Role | Email | Password | Access & Responsibilities |
|---|---|---|---|
| 👑 **Administrator** | `admin@scholaverse.edu` | `Admin@123` | Master control over students, teachers, academics, attendance, examinations, fee structures, reports, and system audit logs. |
| 👩‍🏫 **Teacher** | `sarah.jenkins@scholaverse.edu` | `Teacher@123` | Scoped to Grade 10 Section A (Maths & Homeroom). Marks daily attendance, enters exam marks, views class performance. |
| 👩‍🏫 **Teacher (Alt)** | `robert.chen@scholaverse.edu` | `Teacher@123` | Scoped to English Literature. |
| 👨‍👩‍👦 **Guardian** | `michael.vance@parent.scholaverse.edu` | `Guardian@123` | Linked to Lucas Vance (Grade 10) and Sophia Vance (Grade 9). Views attendance %, report cards, and settles fees. |
| 👨‍👩‍👦 **Guardian (Alt)** | `elena.rostova@parent.scholaverse.edu` | `Guardian@123` | Linked to Alexander Rostov (Grade 10). |

*Note: All demo profiles contain synthetic data only.*

---

## 4. Local Setup & Installation Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### Step 1: Clone the Repository
```bash
git clone https://github.com/nilanshukumarsingh/School-Management-System.git
cd School-Management-System
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/scholaverse
JWT_SECRET=super_secret_jwt_key_scholaverse_production_grade_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

*(Placeholders are also provided in `backend/.env.example` and `frontend/.env.example`)*

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 4: Seed the Database with Realistic Demo Data
From the `backend` folder:
```bash
cd backend
npm run seed
```
This populates sample academic years, classes (Grade 9 & 10), sections, subjects, faculty assignments, enrolled students, attendance sessions, midterm examinations, fee structures, reconciled invoices, and initial audit logs.

### Step 5: Start the Application

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
# OpenAPI Docs available at http://localhost:5000/api-docs
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Client starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the ScholaVerse public landing page.

---

## 5. Automated Testing

The backend includes an automated test suite covering all core business workflows and edge cases:

```bash
cd backend
npm test
```

### Passing Test Output Summary:
```text
PASS src/tests/acceptance_criteria.test.js
  School Management System - Acceptance Tests
    Acceptance Test 1: Teacher Class Authorization
      ✓ allows a teacher to record attendance for an ASSIGNED class/section (634 ms)
      ✓ rejects a teacher trying to record attendance for an UNASSIGNED section (403 Forbidden) (191 ms)
    Acceptance Test 2: Duplicate Attendance Handling
      ✓ rejects duplicate attendance for the same student, date and session (409 Conflict) (182 ms)
      ✓ safely updates existing record when overwriteIfDuplicate is true (192 ms)
    Acceptance Test 3: Examination Grade & Percentage Calculation
      ✓ correctly calculates total, percentage (92.5%), grade (A+), gpa (4.0) and PASS status (196 ms)
      ✓ rejects invalid marks where marksObtained exceeds maxMarks (400 Bad Request) (171 ms)
    Acceptance Test 4: Guardian Privacy & Data Isolation
      ✓ allows a guardian to view their own linked student profile (166 ms)
      ✓ forbids a guardian from accessing unlinked student profile (403 Forbidden) (163 ms)
      ✓ guardian student list returns ONLY linked children (165 ms)
    Acceptance Test 5: Fee Reconciliation & Simulated Ledger
      ✓ processes partial payment and reconciles paidAmount and dueAmount exactly with ledger (186 ms)
      ✓ rejects duplicate payment with the same idempotency key (409 Conflict) (185 ms)
      ✓ rejects payment amount exceeding the invoice due amount (400 Bad Request) (159 ms)

PASS src/tests/auth_and_rbac.test.js
  Auth & RBAC Test Suite
    ✓ should authenticate user with valid credentials and return JWT token (345 ms)
    ✓ should reject login with invalid password (401) (212 ms)
    ✓ should reject unauthenticated request to protected route (401) (46 ms)
    ✓ should forbid non-admin roles from accessing Admin-only routes (403) (113 ms)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

---

## 6. Database Architecture & ER Diagram

The database utilizes 15 collections with reference ObjectIds and unique compound constraints:

```mermaid
erDiagram
    USER ||--o| TEACHER : profile
    USER ||--o| GUARDIAN : profile
    USER ||--o{ AUDIT_LOG : generates

    ACADEMIC_CLASS ||--|{ SECTION : contains
    ACADEMIC_CLASS ||--|{ SUBJECT : offers
    ACADEMIC_CLASS ||--|{ STUDENT : enrolls
    ACADEMIC_CLASS ||--|{ FEE_STRUCTURE : bills

    SECTION ||--|{ TEACHER_ASSIGNMENT : allocated
    TEACHER ||--|{ TEACHER_ASSIGNMENT : teaches
    SUBJECT ||--o{ TEACHER_ASSIGNMENT : curriculum

    GUARDIAN ||--|{ STUDENT : oversees

    STUDENT ||--|{ ATTENDANCE : records
    STUDENT ||--|{ EXAM_RESULT : grades
    STUDENT ||--|{ FEE_INVOICE : charges

    EXAMINATION ||--|{ EXAM_RESULT : evaluates
    FEE_STRUCTURE ||--|{ FEE_INVOICE : generates
    FEE_INVOICE ||--|{ PAYMENT : reconciles
```

*For complete schema attributes, index definitions, and types, see [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).*

---

## 7. Vercel Multi-Service Deployment

The repository is configured to deploy as a unified **Vercel Multi-Service Project** governed by [`vercel.json`](vercel.json):

- **`backend` service**: Express.js REST API with automatic serverless database caching and interactive OpenAPI docs.
- **`frontend` service**: React Vite Single Page Application.
- **Unified Routing**:
  - `/api/(.*)` &rarr; routes directly to the Express `backend` service.
  - `/api-docs(.*)` &rarr; routes to the Swagger UI on the `backend` service.
  - `/(.*)` &rarr; routes to the Vite `frontend` Single Page Application.

### Quick Deployment Instructions:
1. Import this repository into your [Vercel Dashboard](https://vercel.com/new). Vercel automatically recognizes the multi-service layout from `vercel.json`.
2. Configure your Production Environment Variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`).
   - `JWT_SECRET`: Secure cryptographic key for JWT authentication.
   - `NODE_ENV`: `production`
3. Click **Deploy**. Both services build and deploy under a single unified domain with zero CORS friction.

---

## 8. Interactive API Documentation
OpenAPI 3.0 documentation is mounted via Swagger UI on the backend at:
- **URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Key endpoints documented:
- `POST /api/auth/login` — Authentication & JWT issue
- `GET /api/auth/me` — Authenticated profile & role context
- `GET /api/students` — Filtered student roster with pagination & privacy
- `POST /api/attendance/mark` — Daily attendance recording with duplicate guards
- `POST /api/exams/marks` — Exam mark entry with automated grade computation
- `POST /api/fees/pay` — Simulated fee settlement & ledger reconciliation
- `GET /api/audit-logs` — Administrative audit events

---

## 9. Technical Design Decisions & System Architecture

1. **Modular Express Architecture**: Separation of routes, controllers, models, and middleware enables clean testability and code maintainability.
2. **Server-Side Security**: Authentication tokens are signed with HMAC SHA-256 JWTs. RBAC middleware verifies role permissions on every API request.
3. **Data Integrity & Concurrency**:
   - Attendance sessions enforce unique constraints on `{ studentId, date, session }`.
   - Simulated payments use idempotency keys to prevent duplicate submissions.
   - Invoice totals are reconciled by querying the actual completed payment ledger.
4. **Audit Trail**: High-impact business actions automatically log actor details, affected IDs, and metadata changes to the `AuditLog` collection.

*For detailed architectural rationale, see [docs/TECHNICAL_REPORT.md](docs/TECHNICAL_REPORT.md).*

---

## 10. Known Assumptions & Limitations
- **Simulated Payments**: No real payment gateway (Stripe/PayPal) is integrated. The simulated checkout records mock payment records with transaction receipts and validates ledger reconciliation.
- **Single Institutional Domain**: The platform is modeled as a single institution system with academic years rather than a multi-school SaaS hosting disparate districts.

---

## 11. AI Usage & Attribution Section
- **AI Assistive Technology**: Antigravity AI (Google DeepMind) was utilized during the development process as an architectural design sounding board, automated code generation assistant, test authoring facilitator, and documentation generator.
- **Dataset / Library Attribution**:
  - UI Icons provided by `lucide-react`.
  - Charting visualizations powered by `recharts`.
  - Cartoon school imagery curated from high-resolution royalty-free Unsplash educational collections.
  - Avatar placeholders generated via DiceBear Avatars API.
