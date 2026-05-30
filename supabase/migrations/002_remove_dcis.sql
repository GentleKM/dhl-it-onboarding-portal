-- DCIS 솔루션 제거: recommended_solution CHECK 제약 조건 업데이트
ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_recommended_solution_check;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_recommended_solution_check
  CHECK (recommended_solution IN ('MyDHL+', 'DEC', 'MyDHL API'));
