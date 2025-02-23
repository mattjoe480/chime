import { getPatientProfile, listMedicalRecords, listPrescriptions, listTestResults } from "@/lib/grpc/patient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const patientId = searchParams.get("patientId") || session.user.id;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    try {
        switch (action) {
            case "profile":
                const profile = await getPatientProfile(patientId);
                return Response.json(profile);

            case "medical-records":
                const records = await listMedicalRecords(patientId, page, limit);
                return Response.json(records);

            case "prescriptions":
                const prescriptions = await listPrescriptions(patientId, page, limit);
                return Response.json(prescriptions);

            case "test-results":
                const results = await listTestResults(patientId, page, limit);
                return Response.json(results);

            default:
                return Response.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
} 