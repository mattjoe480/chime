"use client";
import { useSession } from "next-auth/react";

export default function DoctorPatients() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">My Patients</h1>
      <div className="grid gap-6">
        {/* Placeholder for patients list */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <p className="text-muted-foreground">No patients assigned</p>
        </div>
      </div>
    </div>
  );
} 