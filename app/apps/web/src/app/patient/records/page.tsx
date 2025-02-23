"use client";
import { useSession } from "next-auth/react";

export default function PatientRecords() {
  const { data: session } = useSession();

  return (
    <div className="bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Medical Records</h1>
      <div className="grid gap-6">
        {/* Placeholder for medical records */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <p className="text-muted-foreground">No medical records available</p>
        </div>
      </div>
    </div>
  );
} 