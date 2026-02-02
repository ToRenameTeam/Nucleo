-- Seed data for appointments-service
-- Clear existing data
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE availabilities CASCADE;

-- ============================================
-- AVAILABILITIES SEED DATA
-- ============================================
-- All availabilities are between 8:00 and 18:00
-- Doctors: Francesco (Cardiologo), Paolo (Ortopedico), Giorgio (Neurologo), Stefano (Dermatologo), Sara (Pediatra)

-- Doctor IDs from users-service
-- Francesco Verdi (Cardiologo): f0aa4140-8d57-425d-b880-e8cf2008f265
-- Paolo Greco (Ortopedico): 417bf5ac-9fd3-43ca-a160-775b6463eebc
-- Giorgio Costa (Neurologo): c225b306-63de-4e82-af11-76e8ed3f5926
-- Stefano Lombardi (Dermatologo): 1cac71a0-c761-4ea8-b378-8eab4731c524
-- Sara Colombo (Pediatra): 5eab37f0-1d7b-4ded-a7bd-6676b195231a

-- Patient IDs from users-service
-- Mario Rossi: c5d33946-678f-4f3a-a0d6-b3d40eee4a97
-- Elena Ferrari: ccce3cb4-8c3f-467c-9814-7a9076f60ae1
-- Giulia Bianchi: 3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9
-- Luca Romano: 61f38542-ccd6-44ee-acbb-eb72d6824b05
-- Alessandro Ricci: a5ca3979-1359-4a17-b81f-eac3e36064bc
-- Maria Conti: aeb4d41d-c6d1-4784-997e-b06cc62df64b

-- ============================================
-- FRANCESCO VERDI (Cardiologo) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-1111-4aa1-8bb1-111111111111', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-15 09:00:00', 30, 'BOOKED'),
    ('a1b2c3d4-2222-4aa2-8bb2-222222222222', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-20 10:30:00', 30, 'BOOKED'),
    ('a1b2c3d4-3333-4aa3-8bb3-333333333333', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-22 14:00:00', 30, 'BOOKED');

-- Past availability for NO_SHOW appointment
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-4444-4aa4-8bb4-444444444444', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-25 11:00:00', 30, 'BOOKED');

-- Past availability for CANCELLED appointment (returns to AVAILABLE status)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-5555-4aa5-8bb5-555555555555', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-27 15:30:00', 30, 'AVAILABLE');

-- Current week availabilities (some BOOKED for SCHEDULED appointments, some AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-6001-4aa6-8bb6-600100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 08:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6002-4aa6-8bb6-600200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 08:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6003-4aa6-8bb6-600300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 09:00:00', 30, 'BOOKED'),
    ('a1b2c3d4-6004-4aa6-8bb6-600400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 09:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6005-4aa6-8bb6-600500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 10:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6006-4aa6-8bb6-600600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 10:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6007-4aa6-8bb6-600700000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 11:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6008-4aa6-8bb6-600800000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 11:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6009-4aa6-8bb6-600900000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 14:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6010-4aa6-8bb6-601000000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 14:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6011-4aa6-8bb6-601100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 15:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6012-4aa6-8bb6-601200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 15:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6013-4aa6-8bb6-601300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 16:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6014-4aa6-8bb6-601400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 16:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6015-4aa6-8bb6-601500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 17:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-6016-4aa6-8bb6-601600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 17:30:00', 30, 'AVAILABLE');

-- Future availabilities (next week)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-7001-4aa7-8bb7-700100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 08:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7002-4aa7-8bb7-700200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 08:30:00', 30, 'BOOKED'),
    ('a1b2c3d4-7003-4aa7-8bb7-700300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 09:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7004-4aa7-8bb7-700400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 09:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7005-4aa7-8bb7-700500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 10:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7006-4aa7-8bb7-700600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 10:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7007-4aa7-8bb7-700700000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 11:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7008-4aa7-8bb7-700800000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 11:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7009-4aa7-8bb7-700900000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 14:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7010-4aa7-8bb7-701000000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 14:30:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7011-4aa7-8bb7-701100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 15:00:00', 30, 'AVAILABLE'),
    ('a1b2c3d4-7012-4aa7-8bb7-701200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 15:30:00', 30, 'AVAILABLE');

-- ============================================
-- PAOLO GRECO (Ortopedico) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('b2c3d4e5-1111-4bb1-9cc1-111111111111', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-01-10 09:00:00', 60, 'BOOKED'),
    ('b2c3d4e5-2222-4bb2-9cc2-222222222222', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-01-17 10:00:00', 60, 'BOOKED');

-- Current and future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('b2c3d4e5-3001-4bb3-9cc3-300100000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 08:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3002-4bb3-9cc3-300200000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 09:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3003-4bb3-9cc3-300300000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 10:00:00', 60, 'BOOKED'),
    ('b2c3d4e5-3004-4bb3-9cc3-300400000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 11:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3005-4bb3-9cc3-300500000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 14:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3006-4bb3-9cc3-300600000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 15:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3007-4bb3-9cc3-300700000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 16:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-3008-4bb3-9cc3-300800000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 17:00:00', 60, 'AVAILABLE');

INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('b2c3d4e5-4001-4bb4-9cc4-400100000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 08:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4002-4bb4-9cc4-400200000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 09:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4003-4bb4-9cc4-400300000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 10:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4004-4bb4-9cc4-400400000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 11:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4005-4bb4-9cc4-400500000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 14:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4006-4bb4-9cc4-400600000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 15:00:00', 60, 'BOOKED'),
    ('b2c3d4e5-4007-4bb4-9cc4-400700000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 16:00:00', 60, 'AVAILABLE'),
    ('b2c3d4e5-4008-4bb4-9cc4-400800000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 17:00:00', 60, 'AVAILABLE');

-- ============================================
-- GIORGIO COSTA (Neurologo) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('c3d4e5f6-1111-4cc1-9dd1-111111111111', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-01-18 09:30:00', 45, 'BOOKED');

-- Current and future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('c3d4e5f6-2001-4cc2-9dd2-200100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 08:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2002-4cc2-9dd2-200200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 08:45:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2003-4cc2-9dd2-200300000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 09:30:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2004-4cc2-9dd2-200400000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 10:15:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2005-4cc2-9dd2-200500000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 11:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2006-4cc2-9dd2-200600000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 11:45:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2007-4cc2-9dd2-200700000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 14:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2008-4cc2-9dd2-200800000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 14:45:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2009-4cc2-9dd2-200900000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 15:30:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2010-4cc2-9dd2-201000000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 16:15:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2011-4cc2-9dd2-201100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 17:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-2012-4cc2-9dd2-201200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-05 17:45:00', 45, 'AVAILABLE');

INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('c3d4e5f6-3001-4cc3-9dd3-300100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 08:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3002-4cc3-9dd3-300200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 08:45:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3003-4cc3-9dd3-300300000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 09:30:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3004-4cc3-9dd3-300400000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 10:15:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3005-4cc3-9dd3-300500000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 11:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3006-4cc3-9dd3-300600000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 11:45:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3007-4cc3-9dd3-300700000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 14:00:00', 45, 'AVAILABLE'),
    ('c3d4e5f6-3008-4cc3-9dd3-300800000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-02-12 14:45:00', 45, 'AVAILABLE');

-- ============================================
-- STEFANO LOMBARDI (Dermatologo) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('d4e5f6a7-1111-4dd1-9ee1-111111111111', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-01-25 14:00:00', 30, 'BOOKED');

-- Current and future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('d4e5f6a7-2001-4dd2-9ee2-200100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 08:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2002-4dd2-9ee2-200200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 08:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2003-4dd2-9ee2-200300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 09:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2004-4dd2-9ee2-200400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 09:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2005-4dd2-9ee2-200500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 10:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2006-4dd2-9ee2-200600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 10:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2007-4dd2-9ee2-200700000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 11:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2008-4dd2-9ee2-200800000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 11:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2009-4dd2-9ee2-200900000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 14:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2010-4dd2-9ee2-201000000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 14:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2011-4dd2-9ee2-201100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 15:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2012-4dd2-9ee2-201200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 15:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2013-4dd2-9ee2-201300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 16:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2014-4dd2-9ee2-201400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 16:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2015-4dd2-9ee2-201500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 17:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-2016-4dd2-9ee2-201600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-06 17:30:00', 30, 'AVAILABLE');

INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('d4e5f6a7-3001-4dd3-9ee3-300100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 08:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-3002-4dd3-9ee3-300200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 08:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-3003-4dd3-9ee3-300300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 09:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-3004-4dd3-9ee3-300400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 09:30:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-3005-4dd3-9ee3-300500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 10:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-3006-4dd3-9ee3-300600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-02-13 10:30:00', 30, 'AVAILABLE');

-- ============================================
-- SARA COLOMBO (Pediatra) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('e5f6a7b8-1111-4ee1-9ff1-111111111111', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-01-22 10:00:00', 45, 'BOOKED');

-- Current and future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('e5f6a7b8-2001-4ee2-9ff2-200100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 08:00:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2002-4ee2-9ff2-200200000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 08:45:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2003-4ee2-9ff2-200300000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 09:30:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2004-4ee2-9ff2-200400000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 10:15:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2005-4ee2-9ff2-200500000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 11:00:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2006-4ee2-9ff2-200600000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 11:45:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2007-4ee2-9ff2-200700000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 14:00:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2008-4ee2-9ff2-200800000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 14:45:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2009-4ee2-9ff2-200900000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 15:30:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2010-4ee2-9ff2-201000000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 16:15:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-2011-4ee2-9ff2-201100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-07 17:00:00', 45, 'AVAILABLE');

INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('e5f6a7b8-3001-4ee3-9ff3-300100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 08:00:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-3002-4ee3-9ff3-300200000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 08:45:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-3003-4ee3-9ff3-300300000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 09:30:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-3004-4ee3-9ff3-300400000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 10:15:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-3005-4ee3-9ff3-300500000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 11:00:00', 45, 'AVAILABLE'),
    ('e5f6a7b8-3006-4ee3-9ff3-300600000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-02-14 11:45:00', 45, 'AVAILABLE');

-- ============================================
-- APPOINTMENTS SEED DATA
-- ============================================
-- Appointments must match BOOKED availabilities
-- Status: SCHEDULED (future), COMPLETED (past), NO_SHOW (past), CANCELLED (past, availability returns to AVAILABLE)

-- COMPLETED APPOINTMENTS (past)
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    -- Francesco Verdi appointments
    ('f1a2b3c4-1111-4ff1-9aa1-111111111111', 'a1b2c3d4-1111-4aa1-8bb1-111111111111', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-15 09:00:00', 30, 'COMPLETED', 'Visita cardiologica di controllo - Esito positivo', '2026-01-10 14:30:00', '2026-01-15 09:35:00'),
    ('f1a2b3c4-2222-4ff2-9aa2-222222222222', 'a1b2c3d4-2222-4aa2-8bb2-222222222222', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-20 10:30:00', 30, 'COMPLETED', 'Controllo parametri cardiovascolari - Tutto nella norma', '2026-01-15 11:20:00', '2026-01-20 11:05:00'),
    ('f1a2b3c4-3333-4ff3-9aa3-333333333333', 'a1b2c3d4-3333-4aa3-8bb3-333333333333', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-22 14:00:00', 30, 'COMPLETED', 'Prescrizione ECG - Esito nella norma', '2026-01-18 09:45:00', '2026-01-22 14:35:00'),
    
    -- Paolo Greco appointments
    ('f1a2b3c4-4444-4ff4-9aa4-444444444444', 'b2c3d4e5-1111-4bb1-9cc1-111111111111', '61f38542-ccd6-44ee-acbb-eb72d6824b05', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-01-10 09:00:00', 60, 'COMPLETED', 'Prima visita ortopedica per dolore ginocchio - Prescrizione RMN', '2026-01-05 16:30:00', '2026-01-10 10:05:00'),
    ('f1a2b3c4-5555-4ff5-9aa5-555555555555', 'b2c3d4e5-2222-4bb2-9cc2-222222222222', 'aeb4d41d-c6d1-4784-997e-b06cc62df64b', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-01-17 10:00:00', 60, 'COMPLETED', 'Controllo densitometria ossea - Osteoporosi moderata', '2026-01-12 10:15:00', '2026-01-17 11:10:00'),
    
    -- Giorgio Costa appointments
    ('f1a2b3c4-6666-4ff6-9aa6-666666666666', 'c3d4e5f6-1111-4cc1-9dd1-111111111111', 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', '2026-01-18 09:30:00', 45, 'COMPLETED', 'Visita neurologica per emicrania - Terapia preventiva', '2026-01-14 15:20:00', '2026-01-18 10:20:00'),
    
    -- Stefano Lombardi appointments
    ('f1a2b3c4-7777-4ff7-9aa7-777777777777', 'd4e5f6a7-1111-4dd1-9ee1-111111111111', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-002', '2026-01-25 14:00:00', 30, 'COMPLETED', 'Visita dermatologica - Prescrizione crema per dermatite', '2026-01-20 11:45:00', '2026-01-25 14:35:00'),
    
    -- Sara Colombo appointments
    ('f1a2b3c4-8888-4ff8-9aa8-888888888888', 'e5f6a7b8-1111-4ee1-9ff1-111111111111', '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-005', '2026-01-22 10:00:00', 45, 'COMPLETED', 'Visita pediatrica - Faringite acuta, prescritto antibiotico', '2026-01-19 14:30:00', '2026-01-22 10:50:00');

-- NO_SHOW APPOINTMENT
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('f1a2b3c4-9999-4ff9-9aa9-999999999999', 'a1b2c3d4-4444-4aa4-8bb4-444444444444', 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-25 11:00:00', 30, 'NO_SHOW', 'Paziente non si è presentato senza preavviso', '2026-01-22 16:45:00', '2026-01-25 11:35:00');

-- CANCELLED APPOINTMENT (availability tornata AVAILABLE)
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('f1a2b3c4-aaaa-4ffa-9aaa-aaaaaaaaaaaa', 'a1b2c3d4-5555-4aa5-8bb5-555555555555', '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-01-27 15:30:00', 30, 'CANCELLED', 'Cancellato dal paziente per impegno improvviso', '2026-01-23 10:15:00', '2026-01-26 18:30:00');

-- SCHEDULED APPOINTMENTS (future)
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    -- Francesco Verdi scheduled appointments
    ('f1a2b3c4-bbbb-4ffb-9aab-bbbbbbbbbbbb', 'a1b2c3d4-6003-4aa6-8bb6-600300000000', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-03 09:00:00', 30, 'SCHEDULED', 'Controllo pressione arteriosa', '2026-01-28 10:20:00', '2026-01-28 10:20:00'),
    ('f1a2b3c4-cccc-4ffc-9aac-cccccccccccc', 'a1b2c3d4-7002-4aa7-8bb7-700200000000', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-001', '2026-02-10 08:30:00', 30, 'SCHEDULED', 'Visita cardiologica di controllo', '2026-01-29 15:45:00', '2026-01-29 15:45:00'),
    
    -- Paolo Greco scheduled appointments
    ('f1a2b3c4-dddd-4ffd-9aad-dddddddddddd', 'b2c3d4e5-3003-4bb3-9cc3-300300000000', '61f38542-ccd6-44ee-acbb-eb72d6824b05', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-04 10:00:00', 60, 'SCHEDULED', 'Controllo post-RMN ginocchio', '2026-01-30 09:30:00', '2026-01-30 09:30:00'),
    ('f1a2b3c4-eeee-4ffe-9aae-eeeeeeeeeeee', 'b2c3d4e5-4006-4bb4-9cc4-400600000000', 'aeb4d41d-c6d1-4784-997e-b06cc62df64b', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', '2026-02-11 15:00:00', 60, 'SCHEDULED', 'Controllo terapia osteoporosi', '2026-01-30 14:15:00', '2026-01-30 14:15:00');

-- SUMMARY FOR VERIFICATION:
-- Francesco Verdi: 3 COMPLETED + 1 NO_SHOW + 1 CANCELLED + 2 SCHEDULED = 7 appointments
--   BOOKED availabilities: 3 (past completed) + 1 (past no_show) + 1 (current scheduled) + 1 (future scheduled) = 6 BOOKED
--   This matches: 3 COMPLETED + 1 NO_SHOW + 2 SCHEDULED = 6 (CANCELLED excluded)
--
-- Paolo Greco: 2 COMPLETED + 2 SCHEDULED = 4 appointments
--   BOOKED availabilities: 2 (past) + 1 (current) + 1 (future) = 4 BOOKED
--   This matches: 2 COMPLETED + 2 SCHEDULED = 4
--
-- Giorgio Costa: 1 COMPLETED + 0 SCHEDULED = 1 appointment
--   BOOKED availabilities: 1 (past) = 1 BOOKED
--   This matches: 1 COMPLETED
--
-- Stefano Lombardi: 1 COMPLETED + 0 SCHEDULED = 1 appointment
--   BOOKED availabilities: 1 (past) = 1 BOOKED
--   This matches: 1 COMPLETED
--
-- Sara Colombo: 1 COMPLETED + 0 SCHEDULED = 1 appointment
--   BOOKED availabilities: 1 (past) = 1 BOOKED
--   This matches: 1 COMPLETED
--
-- TOTAL BOOKED AVAILABILITIES: 6 + 4 + 1 + 1 + 1 = 13
-- TOTAL APPOINTMENTS (excluding CANCELLED): 3 + 1 + 2 + 2 + 2 + 1 + 1 + 1 = 13 ✓


-- Insert sample availabilities for testing
-- Doctor: doc-001 (Cardiologo)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'doc-001', 'facility-001', 'service-001', '2026-02-01 09:00:00', 30, 'AVAILABLE'),
    ('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7', 'doc-001', 'facility-001', 'service-001', '2026-02-01 09:30:00', 30, 'AVAILABLE'),
    ('c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8', 'doc-001', 'facility-001', 'service-001', '2026-02-01 10:00:00', 30, 'AVAILABLE'),
    ('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9', 'doc-001', 'facility-001', 'service-001', '2026-02-01 10:30:00', 30, 'BOOKED'),
    ('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a0', 'doc-001', 'facility-001', 'service-001', '2026-02-01 11:00:00', 30, 'AVAILABLE');

-- Doctor: doc-002 (Dermatologo)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'doc-002', 'facility-002', 'service-002', '2026-02-02 14:00:00', 45, 'AVAILABLE'),
    ('a7b8c9d0-e1f2-43a4-b5c6-d7e8f9a0b1c2', 'doc-002', 'facility-002', 'service-002', '2026-02-02 14:45:00', 45, 'AVAILABLE'),
    ('b8c9d0e1-f2a3-44b5-c6d7-e8f9a0b1c2d3', 'doc-002', 'facility-002', 'service-002', '2026-02-02 15:30:00', 45, 'AVAILABLE');

-- Doctor: doc-003 (Ortopedico)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('c9d0e1f2-a3b4-45c6-d7e8-f9a0b1c2d3e4', 'doc-003', 'facility-001', 'service-003', '2026-02-03 08:00:00', 60, 'AVAILABLE'),
    ('d0e1f2a3-b4c5-46d7-e8f9-a0b1c2d3e4f5', 'doc-003', 'facility-001', 'service-003', '2026-02-03 09:00:00', 60, 'AVAILABLE'),
    ('e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6', 'doc-003', 'facility-001', 'service-003', '2026-02-03 10:00:00', 60, 'BOOKED');

-- Some future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('f2a3b4c5-d6e7-48f9-a0b1-c2d3e4f5a6b7', 'doc-001', 'facility-001', 'service-001', '2026-02-15 09:00:00', 30, 'AVAILABLE'),
    ('a3b4c5d6-e7f8-49a0-b1c2-d3e4f5a6b7c8', 'doc-001', 'facility-001', 'service-001', '2026-02-15 09:30:00', 30, 'AVAILABLE'),
    ('b4c5d6e7-f8a9-40b1-c2d3-e4f5a6b7c8d9', 'doc-002', 'facility-002', 'service-002', '2026-02-20 14:00:00', 45, 'AVAILABLE'),
    ('c5d6e7f8-a9b0-41c2-d3e4-f5a6b7c8d9e0', 'doc-003', 'facility-003', 'service-003', '2026-02-25 10:00:00', 60, 'AVAILABLE');

-- Sample cancelled availability
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('d6e7f8a9-b0c1-42d3-e4f5-a6b7c8d9e0f1', 'doc-001', 'facility-001', 'service-001', '2026-02-01 16:00:00', 30, 'CANCELLED');

-- Past availabilities (already used for completed/no-show/cancelled appointments)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('11111111-1111-4111-a111-111111111111', 'doc-002', 'facility-002', 'service-002', '2026-01-15 14:00:00', 45, 'BOOKED'),
    ('22222222-2222-4222-a222-222222222222', 'doc-001', 'facility-001', 'service-001', '2026-01-20 09:00:00', 30, 'BOOKED'),
    ('33333333-3333-4333-a333-333333333333', 'doc-002', 'facility-002', 'service-002', '2026-01-22 15:30:00', 45, 'BOOKED'),
    ('44444444-4444-4444-a444-444444444444', 'doc-003', 'facility-003', 'service-003', '2026-01-25 10:00:00', 60, 'BOOKED');

-- Future availabilities for scheduled appointments
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('55555555-5555-4555-a555-555555555555', 'doc-001', 'facility-001', 'service-001', '2026-02-10 11:00:00', 30, 'BOOKED'),
    ('66666666-6666-4666-a666-666666666666', 'doc-002', 'facility-002', 'service-002', '2026-02-12 16:00:00', 45, 'BOOKED'),
    ('77777777-7777-4777-a777-777777777777', 'doc-003', 'facility-001', 'service-003', '2026-02-18 09:00:00', 60, 'BOOKED');

-- ============================================
-- APPOINTMENTS SEED DATA
-- ============================================

-- Sample patients (IDs should match User Context)
-- pat-001: Mario Rossi
-- pat-002: Laura Bianchi
-- pat-003: Giuseppe Verdi

-- Appointment for booked availability d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'd4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9', 'pat-001', 'doc-001', 'facility-001', 'service-001', '2026-02-01 10:30:00', 30, 'SCHEDULED', 'Prima visita cardiologica', '2026-01-20 14:30:00', '2026-01-20 14:30:00');

-- Appointment for booked availability e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'e1f2a3b4-c5d6-47e8-f9a0-b1c2d3e4f5a6', 'pat-002', 'doc-003', 'facility-001', 'service-003', '2026-02-03 10:00:00', 60, 'SCHEDULED', 'Visita ortopedica ginocchio', '2026-01-22 09:15:00', '2026-01-22 09:15:00');

-- Sample completed appointments (past dates)
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('cccccccc-cccc-4ccc-cccc-cccccccccccc', '11111111-1111-4111-a111-111111111111', 'pat-001', 'doc-002', 'facility-002', 'service-002', '2026-01-15 14:00:00', 45, 'COMPLETED', 'Controllo dermatologico - tutto ok', '2026-01-10 11:20:00', '2026-01-15 14:50:00'),
    ('dddddddd-dddd-4ddd-dddd-dddddddddddd', '22222222-2222-4222-a222-222222222222', 'pat-003', 'doc-001', 'facility-001', 'service-001', '2026-01-20 09:00:00', 30, 'COMPLETED', 'Visita cardiologica di controllo', '2026-01-15 16:45:00', '2026-01-20 09:35:00');

-- Sample no-show appointment
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', '33333333-3333-4333-a333-333333333333', 'pat-002', 'doc-002', 'facility-002', 'service-002', '2026-01-22 15:30:00', 45, 'NO_SHOW', 'Paziente non si è presentato', '2026-01-18 10:00:00', '2026-01-22 16:00:00');

-- Sample cancelled appointment
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('ffffffff-ffff-4fff-ffff-ffffffffffff', '44444444-4444-4444-a444-444444444444', 'pat-003', 'doc-003', 'facility-003', 'service-003', '2026-01-25 10:00:00', 60, 'CANCELLED', 'Cancellato dal paziente per impegni lavorativi', '2026-01-20 08:30:00', '2026-01-24 19:20:00');

-- Sample future scheduled appointments
INSERT INTO appointments (appointment_id, availability_id, patient_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status, notes, created_at, updated_at)
VALUES 
    ('10101010-1010-4010-a010-101010101010', '55555555-5555-4555-a555-555555555555', 'pat-002', 'doc-001', 'facility-001', 'service-001', '2026-02-10 11:00:00', 30, 'SCHEDULED', 'Controllo cardiologico', '2026-01-28 10:15:00', '2026-01-28 10:15:00'),
    ('20202020-2020-4020-a020-202020202020', '66666666-6666-4666-a666-666666666666', 'pat-003', 'doc-002', 'facility-002', 'service-002', '2026-02-12 16:00:00', 45, 'SCHEDULED', 'Prima visita dermatologica', '2026-01-28 15:30:00', '2026-01-28 15:30:00'),
    ('30303030-3030-4030-a030-303030303030', '77777777-7777-4777-a777-777777777777', 'pat-001', 'doc-003', 'facility-001', 'service-003', '2026-02-18 09:00:00', 60, 'SCHEDULED', 'Controllo post-operatorio', '2026-01-29 08:45:00', '2026-01-29 08:45:00');
