import { patient } from "@/proto/patient";
import { addAuthToken, getService } from "@/lib/grpc/client";
import { getAuthMetadata } from "@/lib/grpc/client";
import patientClient = patient.PatientServiceClient;
import { Metadata, ServiceError } from "@grpc/grpc-js";
import { google } from "@/proto/google/protobuf/timestamp";
import { logger } from "@/next-logger.config";

type PatientResponse<T> = Promise<T>;

function dateToTimestamp(date: Date): google.protobuf.Timestamp {
    return google.protobuf.Timestamp.fromObject({
        seconds: Math.floor(date.getTime() / 1000),
        nanos: (date.getTime() % 1000) * 1e6
    });
}

// Profile Management
export async function getPatientProfile(patientId: string): PatientResponse<patient.GetPatientProfileResponse> {
    const client = await getService<patientClient>("patient.PatientService");
    const request = new patient.GetPatientProfileRequest({ patient_id: patientId });
    
    return new Promise((resolve, reject) => {
        client.getPatientProfile(request, (err: ServiceError | null, response: patient.GetPatientProfileResponse) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// Medical Records
export async function listMedicalRecords(patientId: string, page: number = 1, limit: number = 10) {
    const client = await getService<patientClient>("patient.PatientService");
    const request = new patient.ListMedicalRecordsRequest({ 
        patient_id: patientId,
        page,
        limit 
    });

    return new Promise((resolve, reject) => {
        client.listMedicalRecords(request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// Appointments
export async function bookAppointment(
    patientId: string, 
    doctorId: string, 
    datetime: Date,
    type: string,
    reason: string,
    token: string
) {
    const client = await getService<patientClient>("patient.PatientService");
    const request = new patient.BookAppointmentRequest({
        patient_id: patientId,
        doctor_id: doctorId,
        datetime: dateToTimestamp(datetime),
        type,
        reason
    });
    logger.info("Booking appointment request:", request.toObject());
    logger.info("Token:"+ token);

    return new Promise((resolve, reject) => {
        client.bookAppointment(request, addAuthToken(token), (err, response) => {
            if (err) {
                logger.error("Error booking appointment:" + err);
                reject(err);
            } else {
                logger.info("Appointment booked successfully:", response);
                resolve(response);
            }
        });
    });
}

export async function listAppointments(
    patientId: string, 
    page: number = 1, 
    limit: number = 10,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    token: string
) {
    const client = await getService<patientClient>("patient.PatientService");
    const request = new patient.ListAppointmentsRequest({
        patient_id: patientId,
        page,
        limit,
        status,
        start_date: startDate ? dateToTimestamp(startDate) : undefined,
        end_date: endDate ? dateToTimestamp(endDate) : undefined
    });

    return new Promise((resolve, reject) => {
        client.listAppointments(request, addAuthToken(token), (err, response) => {
            logger.info("List appointments response:" + response);
            if (err) return reject(err);
            resolve(response);
        });
    });
}

export async function cancelAppointment(appointmentId: string, reason: string) {
    const client = await getService<patientClient>("patient.PatientService");
    const request = new patient.CancelAppointmentRequest({
        appointment_id: appointmentId,
        reason
    });

    return new Promise((resolve, reject) => {
        client.cancelAppointment(request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
} 