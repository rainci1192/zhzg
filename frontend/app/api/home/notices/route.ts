import { NextResponse } from "next/server";
import { getHomeNotices } from '@/lib/api';

export async function GET() {
  try {
    const result = await getHomeNotices();
    return NextResponse.json({ code: 0, data: result.data.slice(0, 8) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: 502, message: "Strapi 服务暂不可用" }, { status: 502 });
  }
}
