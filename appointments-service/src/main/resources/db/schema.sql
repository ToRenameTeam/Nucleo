-- Create availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
    availability_id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    facility_id VARCHAR(50) NOT NULL,
    service_type_id VARCHAR(50) NOT NULL,
    start_date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    CHECK (duration_minutes > 0),
    CHECK (status IN ('AVAILABLE', 'BOOKED', 'CANCELLED'))
);

-- Create indices for common queries on availabilities
CREATE INDEX idx_availabilities_doctor_id ON availabilities(doctor_id);
CREATE INDEX idx_availabilities_facility_id ON availabilities(facility_id);
CREATE INDEX idx_availabilities_service_type_id ON availabilities(service_type_id);
CREATE INDEX idx_availabilities_status ON availabilities(status);
CREATE INDEX idx_availabilities_start_date_time ON availabilities(start_date_time);
CREATE INDEX idx_availabilities_doctor_date ON availabilities(doctor_id, start_date_time);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id VARCHAR(50) PRIMARY KEY,
    availability_id VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    facility_id VARCHAR(50) NOT NULL,
    service_type_id VARCHAR(50) NOT NULL,
    start_date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (duration_minutes > 0),
    CHECK (status IN ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED')),
    FOREIGN KEY (availability_id) REFERENCES availabilities(availability_id)
);

-- Create indices for common queries on appointments
CREATE INDEX idx_appointments_availability_id ON appointments(availability_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_facility_id ON appointments(facility_id);
CREATE INDEX idx_appointments_service_type_id ON appointments(service_type_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_date_time ON appointments(start_date_time);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, start_date_time);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, start_date_time);
