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
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN | TEACHER | GUARDIAN"
        string status
        date lastLogin
    }

    STUDENT {
        ObjectId _id PK
        string admissionNumber UK
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
        ObjectId _id PK
        ObjectId userId FK, UK
        string employeeId UK
        string designation
        string qualification
        string specialization
        string availabilityStatus
    }

    GUARDIAN {
        ObjectId _id PK
        ObjectId userId FK, UK
        string relationship
        string occupation
        ObjectId[] linkedStudentIds FK
    }

    ACADEMIC_CLASS {
        ObjectId _id PK
        string name
        number gradeLevel
        string academicYear
    }

    SECTION {
        ObjectId _id PK
        string name
        ObjectId classId FK
        string roomNumber
        number capacity
    }

    SUBJECT {
        ObjectId _id PK
        string name
        string code
        ObjectId classId FK
        number credits
    }

    TEACHER_ASSIGNMENT {
        ObjectId _id PK
        ObjectId teacherId FK
        ObjectId classId FK
        ObjectId sectionId FK
        ObjectId subjectId FK
        boolean isClassTeacher
        string academicYear
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId sectionId FK
        string date "YYYY-MM-DD"
        string session "FULL_DAY | MORNING | AFTERNOON"
        string status "PRESENT | ABSENT | LATE | LEAVE"
        ObjectId recordedBy FK
    }

    EXAMINATION {
        ObjectId _id PK
        string name
        string examType
        string academicYear
        date startDate
        date endDate
        object[] gradingRules
        string status
    }

    EXAM_RESULT {
        ObjectId _id PK
        ObjectId examinationId FK
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId sectionId FK
        object[] marks
        number totalObtained
        number totalMaxMarks
        number percentage
        string grade
        number gpa
        string status "PASS | FAIL"
    }

    FEE_STRUCTURE {
        ObjectId _id PK
        string name
        ObjectId classId FK
        string academicYear
        string term
        object[] components
        number totalAmount
        date dueDate
    }

    FEE_INVOICE {
        ObjectId _id PK
        string invoiceNumber UK
        ObjectId studentId FK
        ObjectId classId FK
        ObjectId feeStructureId FK
        number totalAmount
        number paidAmount
        number dueAmount
        string status "PENDING | PARTIALLY_PAID | PAID"
        date dueDate
    }

    PAYMENT {
        ObjectId _id PK
        string transactionId UK
        ObjectId invoiceId FK
        ObjectId studentId FK
        number amountPaid
        string paymentMethod
        string receiptNumber UK
        string status "COMPLETED"
        string idempotencyKey UK
        date paymentDate
    }

    AUDIT_LOG {
        ObjectId _id PK
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

1. **Duplicate Attendance Elimination (Acceptance Test #2)**
   - Compound Unique Index: `{ studentId: 1, date: 1, session: 1 }` with `unique: true`
   - Guarantees at database level that duplicate records cannot be generated on the same date and session.

2. **Teacher Assignment Boundaries (Acceptance Test #1)**
   - Compound Unique Index: `{ teacherId: 1, classId: 1, sectionId: 1, subjectId: 1, academicYear: 1 }` with `unique: true`

3. **Exam Result Uniqueness (Acceptance Test #3)**
   - Compound Unique Index: `{ examinationId: 1, studentId: 1 }` with `unique: true`
   - Guarantees one comprehensive result per student per exam cohort.

4. **Fee Ledger Idempotency & Reconciliation (Acceptance Test #5)**
   - Unique Index: `transactionId`
   - Sparse Unique Index: `idempotencyKey` prevents duplicate transaction submissions.
   - Reconciled: `invoice.paidAmount` is strictly equal to $\sum (\text{COMPLETED payments})$.
