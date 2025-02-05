import { NextResponse } from "next/server";
import { auth } from "@/proto/auth";
import { getService } from "@/lib/grpc/client";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();
    
    const client = await getService<auth.authClient>("auth.auth");
    const request = new auth.RefreshToken({ token: refresh_token });

    return new Promise((resolve) => {
      client.token(request, (err, response) => {
        if (err || !response) {
          resolve(NextResponse.json({ error: "Failed to refresh token" }, { status: 401 }));
          return;
        }
        resolve(NextResponse.json(response));
      });
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 