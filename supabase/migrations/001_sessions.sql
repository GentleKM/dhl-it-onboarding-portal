-- 세션 테이블: 사용자 입력 및 AI 추천 결과 저장
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key CHAR(6) UNIQUE NOT NULL,             -- 6자리 숫자 조회 코드 (중복 불가)
  business_type TEXT NOT NULL,              -- 업종
  main_product TEXT NOT NULL,               -- 주요 발송물
  monthly_shipments INT NOT NULL,           -- 월 발송 건수
  origin_country VARCHAR(2) NOT NULL,       -- 출발 국가 (ISO 3166-1 alpha-2)
  destination_country VARCHAR(2) NOT NULL,  -- 도착 국가 (ISO 3166-1 alpha-2)
  has_it_system BOOLEAN,                    -- IT 시스템 보유 여부 (NULL = 모르겠음)
  recommended_solution TEXT NOT NULL CHECK (
    recommended_solution IN ('MyDHL+', 'DEC', 'MyDHL API', 'DCIS')
  ),
  recommendation_reason TEXT NOT NULL,      -- AI 추천 근거
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6자리 유니크 숫자 key 생성 함수 (충돌 재시도 포함)
CREATE OR REPLACE FUNCTION generate_unique_session_key()
RETURNS CHAR(6) AS $$
DECLARE
  new_key CHAR(6);
BEGIN
  LOOP
    -- 100000~999999 범위의 6자리 숫자
    new_key := LPAD(FLOOR(RANDOM() * 900000 + 100000)::BIGINT::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM sessions WHERE key = new_key);
  END LOOP;
  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- key 인덱스 (재조회 성능)
CREATE INDEX IF NOT EXISTS sessions_key_idx ON sessions (key);

-- created_at 인덱스 (관리용)
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions (created_at DESC);
