import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { data: user } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return;
  }

  const body = await req.json();

  const blob = new Blob([JSON.stringify(body, null, 2)], {
    type: "application/json",
  });

  const filePath = "dataset.json";

  const { data, error } = await supabase.storage
    .from("menu")
    .upload(filePath, blob, {
      contentType: "application/json",
    });

  return NextResponse.json({
    msg: "File added sucessfully",
    body: data,
  });
}

export async function GET() {
  // const filePath = path.join(process.cwd(), "src", "dataset.json");
  // const data = fs.readFileSync(filePath, "utf8");

  const filePath = "dataset.json";

  const { data, error } = await supabase.storage
    .from("menu")
    .createSignedUrl(filePath, 60);
  if (!data) {
    return NextResponse.json({
      msg: "nofile",
    });
  }
  const response = await fetch(data.signedUrl);
  const jsonData = await response.json();

  return NextResponse.json({
    data: jsonData,
  });
}
