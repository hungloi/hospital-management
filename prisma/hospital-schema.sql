-- HUNG LOI GENERAL HOSPITAL
-- PostgreSQL schema - core HIS
-- Designed around clinical encounters, inpatient stays, orders, inventory and billing.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS hospital;
SET search_path TO hospital, public;

CREATE TYPE gender_code AS ENUM ('M','F','O');
CREATE TYPE patient_status AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE appointment_status AS ENUM ('BOOKED','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW');
CREATE TYPE encounter_type AS ENUM ('OUTPATIENT','EMERGENCY','INPATIENT','FOLLOW_UP');
CREATE TYPE encounter_status AS ENUM ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE registration_type AS ENUM ('INSURANCE','SELF_PAY');
CREATE TYPE order_status AS ENUM ('DRAFT','ORDERED','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE admission_status AS ENUM ('ADMITTED','TRANSFERRED','DISCHARGED','CANCELLED');
CREATE TYPE bed_status AS ENUM ('AVAILABLE','OCCUPIED','MAINTENANCE','OUT_OF_SERVICE');
CREATE TYPE surgery_status AS ENUM ('PLANNED','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE invoice_status AS ENUM ('DRAFT','ISSUED','PARTIALLY_PAID','PAID','CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH','BANK_TRANSFER','CARD','QR','ONLINE');
CREATE TYPE payment_status AS ENUM ('PENDING','COMPLETED','VOIDED','REFUNDED');
CREATE TYPE inventory_txn_type AS ENUM ('RECEIPT','ISSUE','RETURN','ADJUSTMENT','TRANSFER_OUT','TRANSFER_IN','DISPOSAL');
CREATE TYPE item_category AS ENUM ('MEDICINE','SUPPLY');
CREATE TYPE document_type AS ENUM ('PRESCRIPTION','LAB_RESULT','IMAGING_RESULT','DISCHARGE_SUMMARY','REFERRAL','SURGERY_RECORD','INVOICE','OTHER');

-- ============================================================
-- ORGANIZATION / ACCESS
-- ============================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_type VARCHAR(30) NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (organization_id, code)
);

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    gender gender_code,
    phone VARCHAR(30),
    email CITEXT,
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    license_no VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    employee_id UUID UNIQUE REFERENCES employees(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- FACILITIES
-- ============================================================
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (department_id, code)
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES wards(id),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    room_type VARCHAR(30) NOT NULL,
    floor_no SMALLINT,
    capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    code VARCHAR(30) NOT NULL,
    status bed_status NOT NULL DEFAULT 'AVAILABLE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (room_id, code)
);

-- ============================================================
-- PATIENTS / INSURANCE
-- ============================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_code NOT NULL,
    national_id VARCHAR(20),
    phone VARCHAR(30),
    email CITEXT,
    address TEXT,
    status patient_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_patient_national_id ON patients(national_id) WHERE national_id IS NOT NULL;

CREATE TABLE patient_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50),
    phone VARCHAR(30) NOT NULL,
    address TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE insurance_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    insurance_no VARCHAR(50) NOT NULL,
    provider_name VARCHAR(150),
    valid_from DATE,
    valid_to DATE,
    benefit_rate NUMERIC(5,2) CHECK (benefit_rate BETWEEN 0 AND 100),
    registered_facility VARCHAR(200),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (insurance_no, valid_from)
);

-- ============================================================
-- SCHEDULING / REGISTRATION / ENCOUNTERS
-- ============================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    doctor_id UUID REFERENCES employees(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'BOOKED',
    reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_appointments_doctor_time ON appointments(doctor_id, scheduled_at);
CREATE INDEX ix_appointments_patient_time ON appointments(patient_id, scheduled_at DESC);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    registration_no VARCHAR(40) NOT NULL UNIQUE,
    registration_type registration_type NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    queue_no INTEGER,
    created_by UUID REFERENCES users(id)
);
CREATE INDEX ix_registrations_queue ON registrations(department_id, registered_at, queue_no);

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    registration_id UUID REFERENCES registrations(id),
    encounter_type encounter_type NOT NULL,
    department_id UUID REFERENCES departments(id),
    attending_doctor_id UUID REFERENCES employees(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    status encounter_status NOT NULL DEFAULT 'OPEN',
    chief_complaint TEXT,
    clinical_summary TEXT
);
CREATE INDEX ix_encounters_patient_time ON encounters(patient_id, started_at DESC);

CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    temperature_c NUMERIC(4,1) CHECK (temperature_c BETWEEN 20 AND 50),
    pulse_bpm INTEGER CHECK (pulse_bpm BETWEEN 20 AND 250),
    respiratory_rate INTEGER CHECK (respiratory_rate BETWEEN 1 AND 100),
    systolic_bp INTEGER CHECK (systolic_bp BETWEEN 40 AND 300),
    diastolic_bp INTEGER CHECK (diastolic_bp BETWEEN 20 AND 200),
    spo2 NUMERIC(5,2) CHECK (spo2 BETWEEN 0 AND 100),
    weight_kg NUMERIC(6,2) CHECK (weight_kg > 0),
    height_cm NUMERIC(6,2) CHECK (height_cm > 0),
    measured_by UUID REFERENCES employees(id)
);

CREATE TABLE emergency_triage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL UNIQUE REFERENCES encounters(id) ON DELETE CASCADE,
    triage_level VARCHAR(10) NOT NULL CHECK (triage_level IN ('RED','ORANGE','YELLOW','GREEN')),
    arrival_mode VARCHAR(40),
    chief_complaint TEXT NOT NULL,
    disposition VARCHAR(40) NOT NULL DEFAULT 'WAITING',
    assigned_doctor_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES employees(id),
    note_type VARCHAR(40) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(250) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE encounter_diagnoses (
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    diagnosis_id UUID NOT NULL REFERENCES diagnoses(id),
    diagnosis_type VARCHAR(20) NOT NULL,
    note TEXT,
    PRIMARY KEY (encounter_id, diagnosis_id, diagnosis_type)
);

-- ============================================================
-- SERVICE CATALOG / ORDERS
-- ============================================================
CREATE TABLE service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    service_group VARCHAR(40) NOT NULL,
    unit VARCHAR(30) NOT NULL DEFAULT 'Lần',
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES service_catalog(id),
    registration_type registration_type NOT NULL,
    price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    valid_from DATE NOT NULL,
    valid_to DATE,
    CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    tax_code VARCHAR(40),
    phone VARCHAR(30),
    email CITEXT,
    address TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medical_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    ordered_by UUID NOT NULL REFERENCES employees(id),
    order_type VARCHAR(30) NOT NULL,
    status order_status NOT NULL DEFAULT 'ORDERED',
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    clinical_note TEXT
);

CREATE TABLE medical_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES medical_orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES service_catalog(id),
    quantity NUMERIC(12,3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    instruction TEXT,
    result_required BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (service_id IS NOT NULL)
);
CREATE INDEX ix_order_items_service ON medical_order_items(service_id);

-- ============================================================
-- LAB / IMAGING
-- ============================================================
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL UNIQUE REFERENCES medical_order_items(id),
    specimen_no VARCHAR(50),
    collected_at TIMESTAMPTZ,
    result_text TEXT,
    conclusion TEXT,
    performed_by UUID REFERENCES employees(id),
    verified_by UUID REFERENCES employees(id),
    verified_at TIMESTAMPTZ
);

CREATE TABLE imaging_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL UNIQUE REFERENCES medical_order_items(id),
    performed_at TIMESTAMPTZ,
    findings TEXT,
    conclusion TEXT,
    performed_by UUID REFERENCES employees(id),
    verified_by UUID REFERENCES employees(id),
    verified_at TIMESTAMPTZ
);

-- ============================================================
-- ADMISSION / INPATIENT CARE
-- ============================================================
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    source_encounter_id UUID REFERENCES encounters(id),
    admission_no VARCHAR(40) NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id),
    attending_doctor_id UUID REFERENCES employees(id),
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status admission_status NOT NULL DEFAULT 'ADMITTED',
    admission_reason TEXT
);
CREATE INDEX ix_admissions_patient ON admissions(patient_id, admitted_at DESC);

CREATE TABLE bed_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES beds(id),
    assigned_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_to TIMESTAMPTZ,
    CHECK (assigned_to IS NULL OR assigned_to > assigned_from)
);
CREATE UNIQUE INDEX uq_active_bed_assignment ON bed_assignments(bed_id) WHERE assigned_to IS NULL;
CREATE INDEX ix_bed_assignments_admission ON bed_assignments(admission_id, assigned_from DESC);

CREATE TABLE progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES employees(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    content TEXT NOT NULL
);

-- ============================================================
-- MEDICINES / SUPPLIES / INVENTORY
-- ============================================================
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    active_ingredient VARCHAR(200),
    dosage_form VARCHAR(80),
    strength VARCHAR(80),
    unit VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE medical_supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    warehouse_type VARCHAR(30) NOT NULL,
    department_id UUID REFERENCES departments(id),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE medicine_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    batch_no VARCHAR(80) NOT NULL,
    expiry_date DATE NOT NULL,
    unit_cost NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),
    quantity NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    UNIQUE (medicine_id, warehouse_id, batch_no)
);

CREATE TABLE supply_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_id UUID NOT NULL REFERENCES medical_supplies(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    batch_no VARCHAR(80),
    expiry_date DATE,
    unit_cost NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),
    quantity NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    UNIQUE (supply_id, warehouse_id, batch_no)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    txn_type inventory_txn_type NOT NULL,
    medicine_batch_id UUID REFERENCES medicine_batches(id),
    supply_batch_id UUID REFERENCES supply_batches(id),
    quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(14,2) CHECK (unit_cost >= 0),
    reference_type VARCHAR(40),
    reference_id UUID,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT,
    CHECK ((medicine_batch_id IS NOT NULL) <> (supply_batch_id IS NOT NULL))
);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id),
    prescription_no VARCHAR(40) NOT NULL UNIQUE,
    prescribed_by UUID NOT NULL REFERENCES employees(id),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    note TEXT
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    dosage TEXT NOT NULL,
    frequency VARCHAR(100),
    route VARCHAR(50),
    duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
    instruction TEXT
);

-- ============================================================
-- SURGERY
-- ============================================================
CREATE TABLE operating_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    admission_id UUID REFERENCES admissions(id),
    surgery_code VARCHAR(40) NOT NULL UNIQUE,
    procedure_name VARCHAR(250) NOT NULL,
    diagnosis_before TEXT,
    planned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    operating_room_id UUID REFERENCES operating_rooms(id),
    lead_surgeon_id UUID REFERENCES employees(id),
    status surgery_status NOT NULL DEFAULT 'PLANNED',
    note TEXT,
    CHECK (ended_at IS NULL OR started_at IS NOT NULL AND ended_at >= started_at)
);

CREATE TABLE surgery_team (
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    team_role VARCHAR(50) NOT NULL,
    PRIMARY KEY (surgery_id, employee_id, team_role)
);

CREATE TABLE surgery_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgery_id UUID NOT NULL UNIQUE REFERENCES surgeries(id) ON DELETE CASCADE,
    preoperative_assessment TEXT,
    anesthesia_note TEXT,
    operative_findings TEXT,
    procedure_details TEXT,
    postoperative_diagnosis TEXT,
    complications TEXT,
    postoperative_plan TEXT,
    recorded_by UUID REFERENCES employees(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- BILLING / INSURANCE / PAYMENTS
-- ============================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    admission_id UUID REFERENCES admissions(id),
    invoice_no VARCHAR(40) NOT NULL UNIQUE,
    registration_type registration_type NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    insurance_covered NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (insurance_covered >= 0),
    patient_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (patient_amount >= 0),
    discount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (patient_amount + insurance_covered + discount >= subtotal)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_id UUID REFERENCES service_catalog(id),
    description VARCHAR(250) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    insurance_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (insurance_amount >= 0),
    patient_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (patient_amount >= 0),
    line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL UNIQUE REFERENCES invoices(id),
    insurance_profile_id UUID NOT NULL REFERENCES insurance_profiles(id),
    claim_no VARCHAR(50),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_amount NUMERIC(14,2) CHECK (approved_amount IS NULL OR approved_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    note TEXT
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    receipt_no VARCHAR(40) NOT NULL UNIQUE,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMPTZ,
    received_by UUID REFERENCES users(id),
    transaction_ref VARCHAR(100),
    note TEXT
);
CREATE INDEX ix_payments_invoice ON payments(invoice_id, paid_at DESC);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    refund_no VARCHAR(40) NOT NULL UNIQUE,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    refunded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by UUID REFERENCES users(id)
);

-- ============================================================
-- DISCHARGE / REFERRAL / FOLLOW-UP
-- ============================================================
CREATE TABLE discharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL UNIQUE REFERENCES admissions(id),
    discharged_at TIMESTAMPTZ NOT NULL,
    discharge_diagnosis TEXT NOT NULL,
    treatment_result TEXT,
    discharge_medications TEXT,
    follow_up_instruction TEXT,
    doctor_id UUID NOT NULL REFERENCES employees(id)
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    source_encounter_id UUID REFERENCES encounters(id),
    referral_no VARCHAR(40) NOT NULL UNIQUE,
    receiving_facility VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    clinical_summary TEXT,
    referred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    doctor_id UUID REFERENCES employees(id)
);

CREATE TABLE follow_up_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    source_encounter_id UUID REFERENCES encounters(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    doctor_id UUID REFERENCES employees(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    reason TEXT,
    status appointment_status NOT NULL DEFAULT 'BOOKED'
);

-- ============================================================
-- DOCUMENTS / AUDIT
-- ============================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    document_type document_type NOT NULL,
    reference_type VARCHAR(40),
    reference_id UUID,
    file_name VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(30) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_audit_record ON audit_logs(table_name, record_id, created_at DESC);

-- ============================================================
-- BUSINESS RULES / INDEXES
-- ============================================================
CREATE UNIQUE INDEX uq_active_primary_contact
ON patient_contacts(patient_id)
WHERE is_primary = TRUE;

CREATE UNIQUE INDEX uq_active_insurance_per_patient
ON insurance_profiles(patient_id)
WHERE active = TRUE;

CREATE INDEX ix_patients_name ON patients USING gin (to_tsvector('simple', full_name));
CREATE INDEX ix_orders_encounter ON medical_orders(encounter_id, ordered_at DESC);
CREATE INDEX ix_admission_department_status ON admissions(department_id, status, admitted_at DESC);
CREATE INDEX ix_surgery_schedule ON surgeries(operating_room_id, planned_at);
CREATE INDEX ix_inventory_medicine_batch ON medicine_batches(medicine_id, warehouse_id);
CREATE INDEX ix_inventory_supply_batch ON supply_batches(supply_id, warehouse_id);
CREATE INDEX ix_invoices_patient ON invoices(patient_id, created_at DESC);

-- Prevent obvious invalid inventory references at the database level.
CREATE OR REPLACE FUNCTION validate_inventory_batch() RETURNS trigger AS $$
BEGIN
    IF NEW.medicine_batch_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM hospital.medicine_batches b
            WHERE b.id = NEW.medicine_batch_id AND b.warehouse_id = NEW.warehouse_id
        ) THEN
            RAISE EXCEPTION 'Medicine batch does not belong to warehouse';
        END IF;
    ELSE
        IF NOT EXISTS (
            SELECT 1 FROM hospital.supply_batches b
            WHERE b.id = NEW.supply_batch_id AND b.warehouse_id = NEW.warehouse_id
        ) THEN
            RAISE EXCEPTION 'Supply batch does not belong to warehouse';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_inventory_batch
BEFORE INSERT OR UPDATE ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION validate_inventory_batch();

-- Keep patient updated_at useful without application code having to remember it.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- BASE ROLES
-- ============================================================
INSERT INTO roles(code, name) VALUES
('SUPER_ADMIN', 'Quản trị hệ thống'),
('DIRECTOR', 'Ban giám đốc'),
('DEPARTMENT_HEAD', 'Trưởng khoa'),
('DOCTOR', 'Bác sĩ'),
('NURSE', 'Điều dưỡng'),
('PHARMACIST', 'Dược sĩ'),
('ACCOUNTANT', 'Kế toán'),
('RECEPTIONIST', 'Tiếp nhận'),
('WAREHOUSE', 'Kho'),
('PATIENT', 'Bệnh nhân')
ON CONFLICT (code) DO NOTHING;

COMMIT;
