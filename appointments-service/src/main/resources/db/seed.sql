-- Seed data for testing
-- Sample doctors (IDs should match User Context)
-- Sample facilities (IDs should match Master Data Context)
-- Sample service types (IDs should match Master Data Context)

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
