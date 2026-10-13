import { NextRequest } from "next/server";
import { POST as submitLabFlag } from "../submit/route";

export async function POST(request: NextRequest) {
  return submitLabFlag(request);
}