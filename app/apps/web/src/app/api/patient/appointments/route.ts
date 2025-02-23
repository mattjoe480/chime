import { listAppointments, bookAppointment, cancelAppointment } from "@/lib/grpc/patient";
import { auth } from "@/auth";
import { logger } from "@/next-logger.config";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.chime_refresh_token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || session.user.id;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    try {
        const response = await listAppointments(
            patientId, 
            page, 
            limit, 
            status, 
            startDate, 
            endDate,
            session.user.chime_refresh_token
        );
        logger.info("Appointments: " + response);
        return Response.json(response);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.chime_refresh_token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { doctorId, datetime, type, reason } = body;
        const patientId = session.user.id;

        const response = await bookAppointment(
            patientId, 
            doctorId, 
            new Date(datetime), 
            type, 
            reason,
            session.user.chime_refresh_token
        );
        return Response.json(response);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to book appointment" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");
    const reason = searchParams.get("reason") || "Cancelled by patient";

    if (!appointmentId) {
        return Response.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    try {
        const response = await cancelAppointment(appointmentId, reason);
        return Response.json(response);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to cancel appointment" }, { status: 500 });
    }
} 