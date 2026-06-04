import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "MRM Shopping",
    timestamp: new Date().toISOString(),
  });
}
