TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE availabilities CASCADE;

-- ============================================
-- AVAILABILITIES SEED DATA
-- ============================================
-- All dates are computed relative to CURRENT_DATE at seed execution time.
-- Past slots use negative offsets; present/future use zero or positive offsets.
--
-- Doctor IDs from users-service
-- Francesco Verdi (Cardiologo): f0aa4140-8d57-425d-b880-e8cf2008f265
-- Paolo Greco (Ortopedico): 417bf5ac-9fd3-43ca-a160-775b6463eebc
-- Giorgio Costa (Neurologo): c225b306-63de-4e82-af11-76e8ed3f5926
-- Stefano Lombardi (Dermatologo): 1cac71a0-c761-4ea8-b378-8eab4731c524
-- Sara Colombo (Pediatra): 5eab37f0-1d7b-4ded-a7bd-6676b195231a
--
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

-- Past availabilities for COMPLETED appointments (-28, -24, -22 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('a1b2c3d4-1111-4aa1-8bb1-111111111111', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp - INTERVAL '28 days' + INTERVAL '9 hours', 30, 'BOOKED'),
    ('a1b2c3d4-2222-4aa2-8bb2-222222222222', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp - INTERVAL '24 days' + INTERVAL '10 hours 30 minutes', 30, 'BOOKED'),
    ('a1b2c3d4-3333-4aa3-8bb3-333333333333', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp - INTERVAL '22 days' + INTERVAL '14 hours', 30, 'BOOKED');

-- Past availability for NO_SHOW appointment (-20 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('a1b2c3d4-4444-4aa4-8bb4-444444444444', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp - INTERVAL '20 days' + INTERVAL '11 hours', 30, 'BOOKED');

-- Past availability for CANCELLED appointment (returns to AVAILABLE status, -19 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('a1b2c3d4-5555-4aa5-8bb5-555555555555', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp - INTERVAL '19 days' + INTERVAL '15 hours 30 minutes', 30, 'AVAILABLE');

-- Today's availabilities (some BOOKED for SCHEDULED appointments, some AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('a1b2c3d4-6001-4aa6-8bb6-600100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '8 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6002-4aa6-8bb6-600200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '8 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6003-4aa6-8bb6-600300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '9 hours', 30, 'BOOKED'),
    ('a1b2c3d4-6004-4aa6-8bb6-600400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '9 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6005-4aa6-8bb6-600500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '10 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6006-4aa6-8bb6-600600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '10 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6007-4aa6-8bb6-600700000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '11 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6008-4aa6-8bb6-600800000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '11 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6009-4aa6-8bb6-600900000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '14 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6010-4aa6-8bb6-601000000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '14 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6011-4aa6-8bb6-601100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '15 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6012-4aa6-8bb6-601200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '15 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6013-4aa6-8bb6-601300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '16 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6014-4aa6-8bb6-601400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '16 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-6015-4aa6-8bb6-601500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '17 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-6016-4aa6-8bb6-601600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '17 hours 30 minutes', 30, 'AVAILABLE');

-- Future availabilities (+7 days)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('a1b2c3d4-7001-4aa7-8bb7-700100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '8 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7002-4aa7-8bb7-700200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '8 hours 30 minutes', 30, 'BOOKED'),
    ('a1b2c3d4-7003-4aa7-8bb7-700300000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '9 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7004-4aa7-8bb7-700400000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '9 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-7005-4aa7-8bb7-700500000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '10 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7006-4aa7-8bb7-700600000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '10 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-7007-4aa7-8bb7-700700000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '11 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7008-4aa7-8bb7-700800000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '11 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-7009-4aa7-8bb7-700900000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '14 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7010-4aa7-8bb7-701000000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '14 hours 30 minutes', 30, 'AVAILABLE'),
    ('a1b2c3d4-7011-4aa7-8bb7-701100000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '15 hours', 30, 'AVAILABLE'),
    ('a1b2c3d4-7012-4aa7-8bb7-701200000000', 'f0aa4140-8d57-425d-b880-e8cf2008f265', 'facility-001', 'service-002', CURRENT_DATE::timestamp + INTERVAL '7 days' + INTERVAL '15 hours 30 minutes', 30, 'AVAILABLE');

-- ============================================
-- PAOLO GRECO (Ortopedico) - AVAILABILITIES
-- ============================================

-- Past availabilities for COMPLETED appointments (-29, -24 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('b2c3d4e5-1111-4bb1-9cc1-111111111111', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp - INTERVAL '29 days' + INTERVAL '9 hours', 60, 'BOOKED'),
    ('b2c3d4e5-2222-4bb2-9cc2-222222222222', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp - INTERVAL '24 days' + INTERVAL '10 hours', 60, 'BOOKED');

-- Tomorrow's availabilities (+1 day, one BOOKED for SCHEDULED)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('b2c3d4e5-3001-4bb3-9cc3-300100000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '8 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3002-4bb3-9cc3-300200000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '9 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3003-4bb3-9cc3-300300000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '10 hours', 60, 'BOOKED'),
    ('b2c3d4e5-3004-4bb3-9cc3-300400000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '11 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3005-4bb3-9cc3-300500000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '14 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3006-4bb3-9cc3-300600000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '15 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3007-4bb3-9cc3-300700000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '16 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-3008-4bb3-9cc3-300800000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '1 day' + INTERVAL '17 hours', 60, 'AVAILABLE');

-- Future availabilities (+8 days, one BOOKED for SCHEDULED)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('b2c3d4e5-4001-4bb4-9cc4-400100000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '8 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4002-4bb4-9cc4-400200000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '9 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4003-4bb4-9cc4-400300000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '10 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4004-4bb4-9cc4-400400000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '11 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4005-4bb4-9cc4-400500000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '14 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4006-4bb4-9cc4-400600000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '15 hours', 60, 'BOOKED'),
    ('b2c3d4e5-4007-4bb4-9cc4-400700000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '16 hours', 60, 'AVAILABLE'),
    ('b2c3d4e5-4008-4bb4-9cc4-400800000000', '417bf5ac-9fd3-43ca-a160-775b6463eebc', 'facility-001', 'service-003', CURRENT_DATE::timestamp + INTERVAL '8 days' + INTERVAL '17 hours', 60, 'AVAILABLE');

-- ============================================
-- GIORGIO COSTA (Neurologo) - AVAILABILITIES
-- ============================================

-- Past availability for COMPLETED appointment (-23 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('c3d4e5f6-1111-4cc1-9dd1-111111111111', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp - INTERVAL '23 days' + INTERVAL '9 hours 30 minutes', 45, 'BOOKED');

-- Day after tomorrow (+2 days, one BOOKED for SCHEDULED)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('c3d4e5f6-2001-4cc2-9dd2-200100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '8 hours', 45, 'BOOKED'),
    ('c3d4e5f6-2002-4cc2-9dd2-200200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '8 hours 45 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2003-4cc2-9dd2-200300000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '9 hours 30 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2004-4cc2-9dd2-200400000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '10 hours 15 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2005-4cc2-9dd2-200500000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '11 hours', 45, 'AVAILABLE'),
    ('c3d4e5f6-2006-4cc2-9dd2-200600000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '11 hours 45 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2007-4cc2-9dd2-200700000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '14 hours', 45, 'AVAILABLE'),
    ('c3d4e5f6-2008-4cc2-9dd2-200800000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '14 hours 45 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2009-4cc2-9dd2-200900000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '15 hours 30 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2010-4cc2-9dd2-201000000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '16 hours 15 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-2011-4cc2-9dd2-201100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '17 hours', 45, 'AVAILABLE'),
    ('c3d4e5f6-2012-4cc2-9dd2-201200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '2 days' + INTERVAL '17 hours 45 minutes', 45, 'AVAILABLE');

-- Future availabilities (+9 days, one BOOKED for SCHEDULED)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('c3d4e5f6-3001-4cc3-9dd3-300100000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '8 hours', 45, 'BOOKED'),
    ('c3d4e5f6-3002-4cc3-9dd3-300200000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '8 hours 45 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-3003-4cc3-9dd3-300300000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '9 hours 30 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-3004-4cc3-9dd3-300400000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '10 hours 15 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-3005-4cc3-9dd3-300500000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '11 hours', 45, 'AVAILABLE'),
    ('c3d4e5f6-3006-4cc3-9dd3-300600000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '11 hours 45 minutes', 45, 'AVAILABLE'),
    ('c3d4e5f6-3007-4cc3-9dd3-300700000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '14 hours', 45, 'AVAILABLE'),
    ('c3d4e5f6-3008-4cc3-9dd3-300800000000', 'c225b306-63de-4e82-af11-76e8ed3f5926', 'facility-002', 'service-004', CURRENT_DATE::timestamp + INTERVAL '9 days' + INTERVAL '14 hours 45 minutes', 45, 'AVAILABLE');

-- ============================================
-- STEFANO LOMBARDI (Dermatologo) - AVAILABILITIES
-- ============================================

-- Past availability for COMPLETED appointment (-19 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('d4e5f6a7-1111-4dd1-9ee1-111111111111', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp - INTERVAL '19 days' + INTERVAL '14 hours', 30, 'BOOKED');

-- In 3 days (+3 days, all AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('d4e5f6a7-2001-4dd2-9ee2-200100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '8 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2002-4dd2-9ee2-200200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '8 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2003-4dd2-9ee2-200300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '9 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2004-4dd2-9ee2-200400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '9 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2005-4dd2-9ee2-200500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '10 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2006-4dd2-9ee2-200600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '10 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2007-4dd2-9ee2-200700000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '11 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2008-4dd2-9ee2-200800000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '11 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2009-4dd2-9ee2-200900000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '14 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2010-4dd2-9ee2-201000000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '14 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2011-4dd2-9ee2-201100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '15 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2012-4dd2-9ee2-201200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '15 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2013-4dd2-9ee2-201300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '16 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2014-4dd2-9ee2-201400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '16 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-2015-4dd2-9ee2-201500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '17 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-2016-4dd2-9ee2-201600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '3 days' + INTERVAL '17 hours 30 minutes', 30, 'AVAILABLE');

-- Future availabilities (+10 days, all AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('d4e5f6a7-3001-4dd3-9ee3-300100000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '8 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-3002-4dd3-9ee3-300200000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '8 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-3003-4dd3-9ee3-300300000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '9 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-3004-4dd3-9ee3-300400000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '9 hours 30 minutes', 30, 'AVAILABLE'),
    ('d4e5f6a7-3005-4dd3-9ee3-300500000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '10 hours', 30, 'AVAILABLE'),
    ('d4e5f6a7-3006-4dd3-9ee3-300600000000', '1cac71a0-c761-4ea8-b378-8eab4731c524', 'facility-002', 'service-001', CURRENT_DATE::timestamp + INTERVAL '10 days' + INTERVAL '10 hours 30 minutes', 30, 'AVAILABLE');

-- ============================================
-- SARA COLOMBO (Pediatra) - AVAILABILITIES
-- ============================================

-- Past availability for COMPLETED appointment (-21 days ago)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('e5f6a7b8-1111-4ee1-9ff1-111111111111', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp - INTERVAL '21 days' + INTERVAL '10 hours', 45, 'BOOKED');

-- In 4 days (+4 days, all AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('e5f6a7b8-2001-4ee2-9ff2-200100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '8 hours', 45, 'AVAILABLE'),
    ('e5f6a7b8-2002-4ee2-9ff2-200200000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '8 hours 45 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2003-4ee2-9ff2-200300000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '9 hours 30 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2004-4ee2-9ff2-200400000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '10 hours 15 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2005-4ee2-9ff2-200500000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '11 hours', 45, 'AVAILABLE'),
    ('e5f6a7b8-2006-4ee2-9ff2-200600000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '11 hours 45 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2007-4ee2-9ff2-200700000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '14 hours', 45, 'AVAILABLE'),
    ('e5f6a7b8-2008-4ee2-9ff2-200800000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '14 hours 45 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2009-4ee2-9ff2-200900000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '15 hours 30 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2010-4ee2-9ff2-201000000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '16 hours 15 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-2011-4ee2-9ff2-201100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '4 days' + INTERVAL '17 hours', 45, 'AVAILABLE');

-- Future availabilities (+11 days, all AVAILABLE)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status)
VALUES
    ('e5f6a7b8-3001-4ee3-9ff3-300100000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '8 hours', 45, 'AVAILABLE'),
    ('e5f6a7b8-3002-4ee3-9ff3-300200000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '8 hours 45 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-3003-4ee3-9ff3-300300000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '9 hours 30 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-3004-4ee3-9ff3-300400000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '10 hours 15 minutes', 45, 'AVAILABLE'),
    ('e5f6a7b8-3005-4ee3-9ff3-300500000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '11 hours', 45, 'AVAILABLE'),
    ('e5f6a7b8-3006-4ee3-9ff3-300600000000', '5eab37f0-1d7b-4ded-a7bd-6676b195231a', 'facility-003', 'service-008', CURRENT_DATE::timestamp + INTERVAL '11 days' + INTERVAL '11 hours 45 minutes', 45, 'AVAILABLE');

-- ============================================
-- APPOINTMENTS SEED DATA
-- ============================================
-- Appointments must match BOOKED availabilities
-- Status: SCHEDULED (future), COMPLETED (past), NO_SHOW (past), CANCELLED (past, availability returns to AVAILABLE)

-- COMPLETED APPOINTMENTS (past)
INSERT INTO appointments (appointment_id, availability_id, patient_id, status, created_at, updated_at)
VALUES
    -- Francesco Verdi appointments
    ('f1a2b3c4-1111-4ff1-9aa1-111111111111', 'a1b2c3d4-1111-4aa1-8bb1-111111111111', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '31 days' + INTERVAL '14 hours 30 minutes', CURRENT_DATE::timestamp - INTERVAL '28 days' + INTERVAL '9 hours 35 minutes'),
    ('f1a2b3c4-2222-4ff2-9aa2-222222222222', 'a1b2c3d4-2222-4aa2-8bb2-222222222222', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '27 days' + INTERVAL '11 hours 20 minutes', CURRENT_DATE::timestamp - INTERVAL '24 days' + INTERVAL '11 hours 5 minutes'),
    ('f1a2b3c4-3333-4ff3-9aa3-333333333333', 'a1b2c3d4-3333-4aa3-8bb3-333333333333', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '25 days' + INTERVAL '9 hours 45 minutes', CURRENT_DATE::timestamp - INTERVAL '22 days' + INTERVAL '14 hours 35 minutes'),

    -- Paolo Greco appointments
    ('f1a2b3c4-4444-4ff4-9aa4-444444444444', 'b2c3d4e5-1111-4bb1-9cc1-111111111111', '61f38542-ccd6-44ee-acbb-eb72d6824b05', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '33 days' + INTERVAL '16 hours 30 minutes', CURRENT_DATE::timestamp - INTERVAL '29 days' + INTERVAL '10 hours 5 minutes'),
    ('f1a2b3c4-5555-4ff5-9aa5-555555555555', 'b2c3d4e5-2222-4bb2-9cc2-222222222222', 'aeb4d41d-c6d1-4784-997e-b06cc62df64b', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '27 days' + INTERVAL '10 hours 15 minutes', CURRENT_DATE::timestamp - INTERVAL '24 days' + INTERVAL '11 hours 10 minutes'),

    -- Giorgio Costa appointments
    ('f1a2b3c4-6666-4ff6-9aa6-666666666666', 'c3d4e5f6-1111-4cc1-9dd1-111111111111', 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '26 days' + INTERVAL '15 hours 20 minutes', CURRENT_DATE::timestamp - INTERVAL '23 days' + INTERVAL '10 hours 20 minutes'),

    -- Stefano Lombardi appointments
    ('f1a2b3c4-7777-4ff7-9aa7-777777777777', 'd4e5f6a7-1111-4dd1-9ee1-111111111111', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '22 days' + INTERVAL '11 hours 45 minutes', CURRENT_DATE::timestamp - INTERVAL '19 days' + INTERVAL '14 hours 35 minutes'),

    -- Sara Colombo appointments
    ('f1a2b3c4-8888-4ff8-9aa8-888888888888', 'e5f6a7b8-1111-4ee1-9ff1-111111111111', '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9', 'COMPLETED', CURRENT_DATE::timestamp - INTERVAL '24 days' + INTERVAL '14 hours 30 minutes', CURRENT_DATE::timestamp - INTERVAL '21 days' + INTERVAL '10 hours 50 minutes');

-- NO_SHOW APPOINTMENT
INSERT INTO appointments (appointment_id, availability_id, patient_id, status, created_at, updated_at)
VALUES
    ('f1a2b3c4-9999-4ff9-9aa9-999999999999', 'a1b2c3d4-4444-4aa4-8bb4-444444444444', 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1', 'NO_SHOW', CURRENT_DATE::timestamp - INTERVAL '22 days' + INTERVAL '16 hours 45 minutes', CURRENT_DATE::timestamp - INTERVAL '20 days' + INTERVAL '11 hours 35 minutes');

-- CANCELLED APPOINTMENT (availability tornata AVAILABLE)
INSERT INTO appointments (appointment_id, availability_id, patient_id, status, created_at, updated_at)
VALUES
    ('f1a2b3c4-aaaa-4ffa-9aaa-aaaaaaaaaaaa', 'a1b2c3d4-5555-4aa5-8bb5-555555555555', '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9', 'CANCELLED', CURRENT_DATE::timestamp - INTERVAL '21 days' + INTERVAL '10 hours 15 minutes', CURRENT_DATE::timestamp - INTERVAL '19 days' + INTERVAL '18 hours 30 minutes');

-- SCHEDULED APPOINTMENTS (future)
INSERT INTO appointments (appointment_id, availability_id, patient_id, status, created_at, updated_at)
VALUES
    -- Francesco Verdi scheduled appointments (today and +7 days)
    ('f1a2b3c4-bbbb-4ffb-9aab-bbbbbbbbbbbb', 'a1b2c3d4-6003-4aa6-8bb6-600300000000', 'a5ca3979-1359-4a17-b81f-eac3e36064bc', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '2 days' + INTERVAL '10 hours 20 minutes', CURRENT_DATE::timestamp - INTERVAL '2 days' + INTERVAL '10 hours 20 minutes'),
    ('f1a2b3c4-cccc-4ffc-9aac-cccccccccccc', 'a1b2c3d4-7002-4aa7-8bb7-700200000000', 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '15 hours 45 minutes', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '15 hours 45 minutes'),

    -- Paolo Greco scheduled appointments (tomorrow and +8 days)
    ('f1a2b3c4-dddd-4ffd-9aad-dddddddddddd', 'b2c3d4e5-3003-4bb3-9cc3-300300000000', '61f38542-ccd6-44ee-acbb-eb72d6824b05', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '9 hours 30 minutes', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '9 hours 30 minutes'),
    ('f1a2b3c4-eeee-4ffe-9aae-eeeeeeeeeeee', 'b2c3d4e5-4006-4bb4-9cc4-400600000000', 'aeb4d41d-c6d1-4784-997e-b06cc62df64b', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '14 hours 15 minutes', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '14 hours 15 minutes'),

    -- Giorgio Costa scheduled appointments (+2 days and +9 days)
    ('f1a2b3c4-gggg-4ffg-9aag-gggggggggggg', 'c3d4e5f6-2001-4cc2-9dd2-200100000000', '61f38542-ccd6-44ee-acbb-eb72d6824b05', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '10 hours', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '10 hours'),
    ('f1a2b3c4-hhhh-4ffh-9aah-hhhhhhhhhhhh', 'c3d4e5f6-3001-4cc3-9dd3-300100000000', 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1', 'SCHEDULED', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes', CURRENT_DATE::timestamp - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes');