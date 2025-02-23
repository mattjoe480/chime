"use client";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="User Statistics"
          description="Overview of system users"
        />
        <DashboardCard
          title="Recent Activities"
          description="Latest system activities"
        />
        <DashboardCard
          title="System Health"
          description="Monitor system performance"
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
