# API 명세

## POST /api/recommend

DHL 솔루션 AI 추천 요청.

**Request Body:**
```json
{
  "businessType": "의류 판매상",
  "mainProduct": "의류, 의류 소재",
  "monthlyShipments": 30,
  "originCountry": "KR",
  "destinationCountry": "US",
  "hasItSystem": false
}
```

**Response:**
```json
{
  "key": "847293",
  "solution": "MyDHL+",
  "reason": "의류 판매 30건 규모의 고객에게는 MyDHL+가 적합합니다..."
}
```

**Error Response:**
```json
{
  "error": "에러 메시지"
}
```

---

## POST /api/email

결과를 이메일로 발송.

**Request Body:**
```json
{
  "to": "user@example.com",
  "key": "847293"
}
```

**Response:**
```json
{
  "success": true
}
```
