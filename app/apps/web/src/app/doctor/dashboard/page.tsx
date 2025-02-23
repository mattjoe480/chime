"use client";
import { useSession } from "next-auth/react";

export default function DoctorDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Today's Appointments"
          description="View your scheduled appointments for today"
        />
        <DashboardCard
          title="Patient Overview"
          description="Quick access to patient information"
        />
        <DashboardCard
          title="Recent Activity"
          description="View your recent medical activities"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
