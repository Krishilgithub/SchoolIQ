-- =====================================================
-- SEED DEFAULT EXAM DATA
-- Purpose: Populate exam_types, grading_schemes, and academic years
-- =====================================================

-- Note: Replace {SCHOOL_ID} with your actual school ID
-- You can find it by running: SELECT id FROM schools WHERE name = 'Your School Name';

-- =====================================================
-- 1. ACADEMIC YEARS
-- =====================================================
-- Insert current academic year if none exists
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
SELECT 
    uuid_generate_v7(),
    s.id,
    '2024-2025',
    '2024-04-01',
    '2025-03-31',
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM academic_years ay WHERE ay.school_id = s.id
)
ON CONFLICT DO NOTHING;

-- Insert previous academic year
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
SELECT 
    uuid_generate_v7(),
    s.id,
    '2023-2024',
    '2023-04-01',
    '2024-03-31',
    false
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM academic_years ay WHERE ay.school_id = s.id AND ay.name = '2023-2024'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. TERMS
-- =====================================================
-- Insert terms for each academic year
INSERT INTO terms (id, school_id, academic_year_id, name, start_date, end_date, term_number)
SELECT 
    uuid_generate_v7(),
    ay.school_id,
    ay.id,
    'Term 1',
    ay.start_date,
    ay.start_date + INTERVAL '4 months',
    1
FROM academic_years ay
WHERE NOT EXISTS (
    SELECT 1 FROM terms t 
    WHERE t.academic_year_id = ay.id AND t.term_number = 1
)
ON CONFLICT DO NOTHING;

INSERT INTO terms (id, school_id, academic_year_id, name, start_date, end_date, term_number)
SELECT 
    uuid_generate_v7(),
    ay.school_id,
    ay.id,
    'Term 2',
    ay.start_date + INTERVAL '4 months',
    ay.start_date + INTERVAL '8 months',
    2
FROM academic_years ay
WHERE NOT EXISTS (
    SELECT 1 FROM terms t 
    WHERE t.academic_year_id = ay.id AND t.term_number = 2
)
ON CONFLICT DO NOTHING;

INSERT INTO terms (id, school_id, academic_year_id, name, start_date, end_date, term_number)
SELECT 
    uuid_generate_v7(),
    ay.school_id,
    ay.id,
    'Term 3',
    ay.start_date + INTERVAL '8 months',
    ay.end_date,
    3
FROM academic_years ay
WHERE NOT EXISTS (
    SELECT 1 FROM terms t 
    WHERE t.academic_year_id = ay.id AND t.term_number = 3
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. EXAM TYPES
-- =====================================================
INSERT INTO exam_types (id, school_id, name, code, weightage, description, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'Unit Test',
    'UT',
    10.00,
    'Regular unit tests',
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM exam_types et 
    WHERE et.school_id = s.id AND et.code = 'UT'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_types (id, school_id, name, code, weightage, description, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'Mid-Term Exam',
    'MID',
    30.00,
    'Mid-term examination',
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM exam_types et 
    WHERE et.school_id = s.id AND et.code = 'MID'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_types (id, school_id, name, code, weightage, description, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'Final Exam',
    'FINAL',
    60.00,
    'Final examination',
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM exam_types et 
    WHERE et.school_id = s.id AND et.code = 'FINAL'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_types (id, school_id, name, code, weightage, description, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'Practical Exam',
    'PRAC',
    20.00,
    'Practical examination',
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM exam_types et 
    WHERE et.school_id = s.id AND et.code = 'PRAC'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. GRADING SCHEMES
-- =====================================================
-- Create default percentage-based grading scheme
INSERT INTO grading_schemes_new (id, school_id, name, description, grading_type, is_default, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'Standard Percentage',
    'Standard percentage-based grading',
    'percentage',
    true,
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM grading_schemes_new gs 
    WHERE gs.school_id = s.id AND gs.is_default = true
)
ON CONFLICT DO NOTHING;

-- Create CBSE-style grading scheme
INSERT INTO grading_schemes_new (id, school_id, name, description, grading_type, is_default, is_active)
SELECT 
    uuid_generate_v7(),
    s.id,
    'CBSE Grading (Grade Points)',
    'CBSE-style grade point system',
    'gpa',
    false,
    true
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM grading_schemes_new gs 
    WHERE gs.school_id = s.id AND gs.name = 'CBSE Grading (Grade Points)'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. GRADE BOUNDARIES
-- =====================================================
-- Add grade boundaries for the default percentage scheme
WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'A+',
    90.00,
    100.00,
    10.0,
    'Outstanding',
    1
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'A+'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'A',
    80.00,
    89.99,
    9.0,
    'Excellent',
    2
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'A'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'B+',
    70.00,
    79.99,
    8.0,
    'Very Good',
    3
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'B+'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'B',
    60.00,
    69.99,
    7.0,
    'Good',
    4
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'B'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'C',
    50.00,
    59.99,
    6.0,
    'Satisfactory',
    5
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'C'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'D',
    40.00,
    49.99,
    5.0,
    'Pass',
    6
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'D'
)
ON CONFLICT DO NOTHING;

WITH default_scheme AS (
    SELECT id, school_id 
    FROM grading_schemes_new 
    WHERE is_default = true
)
INSERT INTO grade_boundaries_new (id, grading_scheme_id, grade, min_percentage, max_percentage, grade_point, description, display_order)
SELECT 
    uuid_generate_v7(),
    ds.id,
    'F',
    0.00,
    39.99,
    0.0,
    'Fail',
    7
FROM default_scheme ds
WHERE NOT EXISTS (
    SELECT 1 FROM grade_boundaries_new gb 
    WHERE gb.grading_scheme_id = ds.id AND gb.grade = 'F'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the data was inserted correctly:

-- SELECT * FROM academic_years ORDER BY start_date DESC;
-- SELECT * FROM terms ORDER BY academic_year_id, term_number;
-- SELECT * FROM exam_types ORDER BY weightage DESC;
-- SELECT * FROM grading_schemes_new;
-- SELECT gb.*, gs.name as scheme_name 
-- FROM grade_boundaries_new gb 
-- JOIN grading_schemes_new gs ON gb.grading_scheme_id = gs.id 
-- ORDER BY gs.name, gb.display_order;
