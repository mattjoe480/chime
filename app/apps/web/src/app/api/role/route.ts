import { NextResponse } from "next/server";
import { getRole, createRole } from "@/lib/grpc/role";
import { auth } from "@/proto/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const role = await getRole(email);
    return NextResponse.json({ role });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get role" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || role === undefined) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const status = await createRole(email, role as auth.Roles);
    
    if (status === auth.Status.OK) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to create role" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
} 