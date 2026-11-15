# Database Schema & Entity-Relationship Architecture

## ScholaVerse Academic Operations Platform

This document describes the persistence layer architecture designed for MongoDB using Mongoose ODM, detailing schemas, foreign reference ObjectIds, indexing strategies, and uniqueness constraints.

---

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o| TEACHER : "has profile"
    USER ||--o| GUARDIAN : "has profile"
    USER ||--o{ AUDIT_LOG : "performs actions"

    ACADEMIC_CLASS ||--|{ SECTION : "contains"
    ACADEMIC_CLASS ||--|{ SUBJECT : "offers"
    ACADEMIC_CLASS ||--|{ STUDENT : "enrolled in"
    ACADEMIC_CLASS ||--|{ FEE_STRUCTURE : "defines fees for"

    SECTION ||--|{ STUDENT : "contains"
    SECTION ||--|{ TEACHER_ASSIGNMENT : "allocated to"

    TEACHER ||--|{ TEACHER_ASSIGNMENT : "assigned to"
    SUBJECT ||--o{ TEACHER_ASSIGNMENT : "taught in"

    GUARDIAN ||--|{ STUDENT : "supervises"

    STUDENT ||--|{ ATTENDANCE : "has records"
    STUDENT ||--|{ EXAM_RESULT : "obtains results"
    STUDENT ||--|{ FEE_INVOICE : "billed via"
    STUDENT ||--|{ PAYMENT : "submits"

    EXAMINATION ||--|{ EXAM_RESULT : "evaluates"
    FEE_STRUCTURE ||--|{ FEE_INVOICE : "instantiates"
    FEE_INVOICE ||--|{ PAYMENT : "reconciles with"

    USER {
        ObjectId id PK
        string name
        string email "unique"
        string passwordHash
        string role
        string status
        date lastLogin
    }

    STUDENT {
        ObjectId id PK
        string admissionNumber "unique"
        string firstName
        string lastName
        date dateOfBirth
        string gender
        ObjectId classId FK
        ObjectId sectionId FK
        ObjectId guardianId FK
        number rollNumber
        string status
    }

    TEACHER {
        ObjectId id PK
        ObjectId userId FK "unique"
        string employeeId "unique"
        string designation
        string qualification
        string specialization
        string availabilityStatus
    }

    GUARDIAN {
        ObjectId id PK
        ObjectId userId FK "unique"
        string relationship
        string occupation
        Array linkedStudentIds FK
    }

    ACADEMIC_CLASS {
        ObjectId id PK
        string name
        number gradeLevel
        string academicYear
    }

    SECTION {
        ObjectId id PK
        string name
        ObjectId classId FK
        string roomNumber
        number capacity
    }

    SUBJECT {
        ObjectId id PK
        string name
        string code
        ObjectId classId FK
        number credits
    }

    TEACHER_ASSIGNMENT {
        ObjectId id PK
        ObjectId teacherId FK
        ObjectId classId FK
        ObjectId sectionId FK
        ObjectId subjectId FK
        boolean isClassTeacher
        string academicYear
    }

    ATTENDANCE {
        ObjectId id PK
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId sectionId FK
        string date
        string session
        string status
        ObjectId recordedBy FK
    }

    EXAMINATION {
        ObjectId id PK
        string name
        string examType
        string academicYear
        date startDate
        date endDate
        Array gradingRules
        string status
    }

    EXAM_RESULT {
        ObjectId id PK
        ObjectId examinationId FK
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId sectionId FK
        Array marks
        number totalObtained
        number totalMaxMarks
        number percentage
        string grade
        number gpa
        string status
    }

    FEE_STRUCTURE {
        ObjectId id PK
        string name
        ObjectId classId FK
        string academicYear
        string term
        Array components
        number totalAmount
        date dueDate
    }

    FEE_INVOICE {
        ObjectId id PK
        string invoiceNumber "unique"
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId feeStructureId FK
        number totalAmount
        number paidAmount
        number dueAmount
        string status
        date dueDate
    }

    PAYMENT {
        ObjectId id PK
        string transactionId "unique"
        ObjectId invoiceId FK
        ObjectId studentId FK
        number amountPaid
        string paymentMethod
        string receiptNumber "unique"
        string status
        string idempotencyKey "unique"
        date paymentDate
    }

    AUDIT_LOG {
        ObjectId id PK
        ObjectId userId FK
        string userName
        string userRole
        string action
        string module
        string affectedRecordId
        string affectedModel
        object details
        string ipAddress
        date timestamp
    }
```

---

## 2. Key Indexes & Constraint Guarantees

1. **Duplicate Attendance Elimination**
   - Compound Unique Index: `{ studentId: 1, date: 1, session: 1 }` with `unique: true`
   - Guarantees at database level that duplicate records cannot be generated on the same date and session.

2. **Teacher Assignment Boundaries**
   - Compound Unique Index: `{ teacherId: 1, classId: 1, sectionId: 1, subjectId: 1, academicYear: 1 }` with `unique: true`

3. **Exam Result Uniqueness**
   - Compound Unique Index: `{ examinationId: 1, studentId: 1 }` with `unique: true`
   - Guarantees one comprehensive result per student per exam cohort.

4. **Fee Ledger Idempotency & Reconciliation**
   - Unique Index: `transactionId`
   - Sparse Unique Index: `idempotencyKey` prevents duplicate transaction submissions.
   - Reconciled: `invoice.paidAmount` is strictly equal to the sum of all `COMPLETED` payments.
