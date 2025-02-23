"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // useEffect(() => {
  //   if (!session?.user || session.user.role !== "PATIENT") {
  //     router.push("/auth/signin");
  //   }
  // }, [session, router]);

  return (
    <div className="bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Patient Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Upcoming Appointments"
          description="View and manage your scheduled appointments"
        />
        <DashboardCard
          title="Medical Records"
          description="Access your medical history and documents"
        />
        <DashboardCard
          title="Prescriptions"
          description="View your current prescriptions"
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
