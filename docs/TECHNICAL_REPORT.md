# Technical Design & Architectural Report
## Project: ScholaVerse Academy School Management System

**Author:** Nilanshu Kumar Singh  
**Architecture:** Decoupled React (Vite) + Node.js/Express.js + MongoDB (Mongoose)

---

## 1. Executive Summary
ScholaVerse is an enterprise-grade academic operations platform engineered with a decoupled Node.js/Express.js REST backend and a modern Vite React frontend styled using Tailwind CSS. The platform models the core operational processes of an educational institution: academic scheduling, faculty assignments, daily attendance recording with duplicate guards, examination evaluation with configurable grading curves, and an idempotent financial fee ledger with simulated payment settlement.

---

## 2. Key Architectural Decisions

### 2.1 Backend Architecture
- **Layered Monolith**: Strict separation of concerns between HTTP transport (`routes/`), business flow orchestrators (`controllers/`), schema models (`models/`), input validation (`validators/`), and cross-cutting concerns (`middleware/`).
- **RESTful Envelopes**: All API responses use standard JSON envelopes (`{ success, message, data, meta }`) providing predictable payload parsing for the frontend client.
- **Fail-Safe Centralized Error Handling**: Transforms Mongoose validation errors, CastErrors, and MongoDB code 11000 duplicate key conflicts into clean HTTP status codes (400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Error) without crashing the runtime.

### 2.2 Server-Side Role-Based Access Control (RBAC)
Hiding UI controls is recognized as an incomplete security mechanism. ScholaVerse implements server-side authorization middleware (`authorize('ADMIN', 'TEACHER', 'GUARDIAN')`):
- **Admins** have unrestricted access across master data, fee structures, and audit logs.
- **Teachers** are dynamically scoped via their `TeacherAssignment` mappings. When marking attendance or entering marks, the server cross-references `req.user` against the assignment database, returning `403 Forbidden` if unassigned.
- **Guardians** are strictly restricted via their `Guardian.linkedStudentIds` array. Any direct request for an unlinked student ID or invoice returns `403 Forbidden`, safeguarding student privacy.

---

## 3. Core Business Workflows & Data Integrity Guarantees

| Core Workflow | Institutional Requirement | Technical Implementation | Verified Automated Test |
|---|---|---|---|
| **#1** | Teacher can access only assigned classes & mark attendance | `attendanceController.js` and `examController.js` verify `TeacherAssignment.exists({ teacherId, classId, sectionId })`. Rejects unassigned classes with `403 Forbidden`. | `src/tests/acceptance_criteria.test.js` (Test 1) |
| **#2** | Duplicate attendance rejected or safely updated | Compound unique index `{ studentId: 1, date: 1, session: 1 }`. If `overwriteIfDuplicate=false`, rejects with `409 Conflict`. If `true`, executes safe bulk upsert. | `src/tests/acceptance_criteria.test.js` (Test 2) |
| **#3** | Exam result calculated from configured marks and grading rules | Validates obtained marks <= max marks. Calculates total, percentage, GPA (4.0 scale), and matches against configurable grading rules (A+, A, B, C, D, F). | `src/tests/acceptance_criteria.test.js` (Test 3) |
| **#4** | Guardian sees only linked student information | Middleware populates `req.guardianProfile`. Queries for students, attendance, report cards, and invoices filter by `{ studentId: { $in: guardian.linkedStudentIds } }`. | `src/tests/acceptance_criteria.test.js` (Test 4) |
| **#5** | Fee due & paid totals reconcile with fee ledger | Payments create immutable `Payment` records with idempotency keys. The invoice ledger recalculates `paidAmount` directly from the sum of all `COMPLETED` payments. Rejects overpayment and duplicate requests. | `src/tests/acceptance_criteria.test.js` (Test 5) |

---

## 4. Database Integrity & Concurrency Protection
- **Unique Compound Constraints**: Prevents duplicate attendance sessions, duplicate section names per class, and duplicate student enrollments.
- **Financial Ledger Reconciliation**: Prevents phantom fee balances by re-aggregating the ledger upon every transaction, guaranteeing that `totalAmount = paidAmount + dueAmount`.
- **Immutable Audit Trail**: Key operations (`STUDENT_CREATED`, `ATTENDANCE_RECORDED`, `EXAM_MARKS_RECORDED`, `FEE_PAYMENT_PROCESSED`) append audit records containing user identity, affected record, timestamp, and metadata diffs.

---

## 5. Automated Verification & Quality Assurance
The system includes automated tests powered by **Jest** and **Supertest**:
- **16 passing integration tests** executing end-to-end against a dedicated test database (`scholaverse_test`).
- Tests explicitly cover positive journeys, negative authentication rejections, role violations, duplicate attendance rejections, mark overflow rejections, and fee overpayment guards.
