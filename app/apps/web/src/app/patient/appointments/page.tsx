"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarPlus, Loader2 } from "lucide-react";
import { logger } from "@/next-logger.config";

type Appointment = {
  id: string;
  doctorId: string;
  datetime: Date;
  duration: number;
  type: string;
  status: string;
  reason: string;
  notes: string;
};

export default function PatientAppointments() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedDoctor, setSelectedDoctor] = useState<string>();
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/patient/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      logger.info("Appointments: " + data.appointments);
      setAppointments(data.appointments || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!bookingDate || !selectedType || !selectedDoctor || !reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);
      const response = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          datetime: bookingDate,
          type: selectedType,
          reason,
        }),
      });

      if (!response.ok) throw new Error("Failed to book appointment");

      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });

      // Reset form and refresh appointments
      setBookingDate(undefined);
      setSelectedType(undefined);
      setSelectedDoctor(undefined);
      setReason("");
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Appointments</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Calendar
                mode="single"
                selected={bookingDate}
                onSelect={setBookingDate}
                className="rounded-md border"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Check-up">Check-up</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch actual doctors */}
                  <SelectItem value="90f5dd0d-5251-4e04-8f26-d3eb66b6de56">Dr. Smith</SelectItem>
                  <SelectItem value="doctor2">Dr. Johnson</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Reason for visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button onClick={handleBookAppointment} disabled={isBooking}>
                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {appointments.length === 0 ? (
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <p className="text-muted-foreground">No appointments scheduled</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.type}</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(appointment.datetime), "PPP p")}
                  </p>
                  <p className="mt-2">{appointment.reason}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm ${
                      appointment.status === "Scheduled"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 