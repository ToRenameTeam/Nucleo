-- Seed data for testing
-- Sample doctors (IDs should match User Context)
-- Sample facilities (IDs should match Master Data Context)
-- Sample service types (IDs should match Master Data Context)

-- Insert sample availabilities for testing
-- Doctor: doc-001 (Cardiologo)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('avail-001', 'doc-001', 'facility-001', 'service-001', '2026-02-01 09:00:00', 30, 'AVAILABLE'),
    ('avail-002', 'doc-001', 'facility-001', 'service-001', '2026-02-01 09:30:00', 30, 'AVAILABLE'),
    ('avail-003', 'doc-001', 'facility-001', 'service-001', '2026-02-01 10:00:00', 30, 'AVAILABLE'),
    ('avail-004', 'doc-001', 'facility-001', 'service-001', '2026-02-01 10:30:00', 30, 'BOOKED'),
    ('avail-005', 'doc-001', 'facility-001', 'service-001', '2026-02-01 11:00:00', 30, 'AVAILABLE');

-- Doctor: doc-002 (Dermatologo)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('avail-006', 'doc-002', 'facility-002', 'service-002', '2026-02-02 14:00:00', 45, 'AVAILABLE'),
    ('avail-007', 'doc-002', 'facility-002', 'service-002', '2026-02-02 14:45:00', 45, 'AVAILABLE'),
    ('avail-008', 'doc-002', 'facility-002', 'service-002', '2026-02-02 15:30:00', 45, 'AVAILABLE');

-- Doctor: doc-003 (Ortopedico)
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('avail-009', 'doc-003', 'facility-001', 'service-003', '2026-02-03 08:00:00', 60, 'AVAILABLE'),
    ('avail-010', 'doc-003', 'facility-001', 'service-003', '2026-02-03 09:00:00', 60, 'AVAILABLE'),
    ('avail-011', 'doc-003', 'facility-001', 'service-003', '2026-02-03 10:00:00', 60, 'BOOKED');

-- Some future availabilities
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('avail-012', 'doc-001', 'facility-001', 'service-001', '2026-02-15 09:00:00', 30, 'AVAILABLE'),
    ('avail-013', 'doc-001', 'facility-001', 'service-001', '2026-02-15 09:30:00', 30, 'AVAILABLE'),
    ('avail-014', 'doc-002', 'facility-002', 'service-002', '2026-02-20 14:00:00', 45, 'AVAILABLE'),
    ('avail-015', 'doc-003', 'facility-003', 'service-003', '2026-02-25 10:00:00', 60, 'AVAILABLE');

-- Sample cancelled availability
INSERT INTO availabilities (availability_id, doctor_id, facility_id, service_type_id, start_date_time, duration_minutes, status) 
VALUES 
    ('avail-016', 'doc-001', 'facility-001', 'service-001', '2026-02-01 16:00:00', 30, 'CANCELLED');
