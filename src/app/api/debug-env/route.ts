// 이 파일은 삭제해도 됩니다 (디버깅용 임시 엔드포인트)
// Phase 2 디버깅 완료 후 더 이상 필요하지 않음
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ message: "이 엔드포인트는 삭제 예정입니다." }, { status: 410 });
}
