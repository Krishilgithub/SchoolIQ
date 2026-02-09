
-- Seed Data for SchoolIQ Development

-- 1. Create a demo school
INSERT INTO schools (id, name, slug, school_type, contact_email, subscription_status)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-333333333333', 'Springfield Elementary', 'springfield', 'k12', 'admin@springfield.edu', 'active')
ON CONFLICT DO NOTHING;

-- 2. Create Academic Year
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_active)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-444444444444', '018d4c78-65d8-7e5c-9c71-333333333333', '2024-2025', '2024-04-01', '2025-03-31', true)
ON CONFLICT DO NOTHING;

-- 3. Create a Term
INSERT INTO terms (id, school_id, academic_year_id, name, start_date, end_date)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-555555555555', '018d4c78-65d8-7e5c-9c71-333333333333', '018d4c78-65d8-7e5c-9c71-444444444444', 'Term 1', '2024-04-01', '2024-09-30')
ON CONFLICT DO NOTHING;

-- 4. Create Classes and Sections
INSERT INTO classes (id, school_id, name, level)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-666666666666', '018d4c78-65d8-7e5c-9c71-333333333333', 'Grade 4', 4)
ON CONFLICT DO NOTHING;

INSERT INTO sections (id, class_id, name, capacity)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-666666666666', 'A', 30)
ON CONFLICT DO NOTHING;

-- 5. Create Students
INSERT INTO students (id, school_id, admission_number, first_name, last_name, date_of_birth, gender, enrollment_date)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-888888888801', '018d4c78-65d8-7e5c-9c71-333333333333', 'ADM001', 'Bart', 'Simpson', '2015-04-01', 'male', '2024-04-01'),
    ('018d4c78-65d8-7e5c-9c71-888888888802', '018d4c78-65d8-7e5c-9c71-333333333333', 'ADM002', 'Lisa', 'Simpson', '2017-05-09', 'female', '2024-04-01'),
    ('018d4c78-65d8-7e5c-9c71-888888888803', '018d4c78-65d8-7e5c-9c71-333333333333', 'ADM003', 'Milhouse', 'Van Houten', '2015-07-01', 'male', '2024-04-01')
ON CONFLICT DO NOTHING;

-- 6. Enroll Students
INSERT INTO enrollments (id, student_id, section_id, academic_year_id, roll_number)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-999999999901', '018d4c78-65d8-7e5c-9c71-888888888801', '018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-444444444444', '1'),
    ('018d4c78-65d8-7e5c-9c71-999999999902', '018d4c78-65d8-7e5c-9c71-888888888802', '018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-444444444444', '2'),
    ('018d4c78-65d8-7e5c-9c71-999999999903', '018d4c78-65d8-7e5c-9c71-888888888803', '018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-444444444444', '3')
ON CONFLICT DO NOTHING;

-- 7. Create Subjects
INSERT INTO subjects (id, school_id, name, code, type)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-AAAAAAAAAAAA', '018d4c78-65d8-7e5c-9c71-333333333333', 'Mathematics', 'MATH101', 'theory'),
    ('018d4c78-65d8-7e5c-9c71-BBBBBBBBBBBB', '018d4c78-65d8-7e5c-9c71-333333333333', 'Science', 'SCI101', 'theory')
ON CONFLICT DO NOTHING;

-- Assign Subjects to Section
INSERT INTO section_subjects (id, section_id, subject_id)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-CCCCCCCCCCCC', '018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-AAAAAAAAAAAA'),
    ('018d4c78-65d8-7e5c-9c71-DDDDDDDDDDDD', '018d4c78-65d8-7e5c-9c71-777777777777', '018d4c78-65d8-7e5c-9c71-BBBBBBBBBBBB')
ON CONFLICT DO NOTHING;

-- 8. Attendance Record (One day)
INSERT INTO attendance_registers (id, section_id, date)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-EEEEEEEEEEEE', '018d4c78-65d8-7e5c-9c71-777777777777', CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO attendance_records (register_id, student_id, status)
VALUES 
    ('018d4c78-65d8-7e5c-9c71-EEEEEEEEEEEE', '018d4c78-65d8-7e5c-9c71-888888888801', 'present'),
    ('018d4c78-65d8-7e5c-9c71-EEEEEEEEEEEE', '018d4c78-65d8-7e5c-9c71-888888888802', 'present'),
    ('018d4c78-65d8-7e5c-9c71-EEEEEEEEEEEE', '018d4c78-65d8-7e5c-9c71-888888888803', 'absent')
ON CONFLICT DO NOTHING;
