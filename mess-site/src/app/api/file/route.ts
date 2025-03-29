import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body);

  const filePath = path.join(process.cwd(), "src", "dataset.json");
  fs.writeFileSync(filePath, JSON.stringify(body));

  return NextResponse.json({
    msg: "File added sucessfully",
    body: body,
  });
}

export async function GET() {
  const filePath = path.join(process.cwd(), "src", "dataset.json");
  const data = fs.readFileSync(filePath, "utf8");
  return NextResponse.json({
    data: JSON.parse(data),
  });
}
