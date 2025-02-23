use crate::controllers::initialize::get_postgres_conn;
use crate::entity::{patient, medical_record, prescription, test_result, appointment};
use crate::types::patient::{
    patient_service_server::PatientService,
    PatientProfile, MedicalRecord, Prescription, TestResult, Appointment,
    GetPatientProfileRequest, GetPatientProfileResponse,
    UpdatePatientProfileRequest, UpdatePatientProfileResponse,
    ListMedicalRecordsRequest, ListMedicalRecordsResponse,
    ListPrescriptionsRequest, ListPrescriptionsResponse,
    ListTestResultsRequest, ListTestResultsResponse,
    ListAppointmentsRequest, ListAppointmentsResponse,
    BookAppointmentRequest, BookAppointmentResponse,
    CancelAppointmentRequest, CancelAppointmentResponse,
};
use crate::types::auth::Status;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, 
    QueryFilter, QueryOrder, Set, ActiveValue::NotSet,
};
use tonic::{async_trait, Request, Response, Status as TonicStatus};
use tracing::{error, info};
use uuid::Uuid;
use chrono::{Utc, NaiveDateTime, NaiveDate};

pub struct PatientServiceImpl;

impl PatientServiceImpl {
    fn to_timestamp(&self, dt: impl Into<NaiveDateTime>) -> prost_types::Timestamp {
        let ts = dt.into().timestamp();
        prost_types::Timestamp {
            seconds: ts,
            nanos: 0,
        }
    }

    fn naive_date_to_timestamp(&self, date: NaiveDate) -> prost_types::Timestamp {
        self.to_timestamp(date.and_hms_opt(0, 0, 0).unwrap())
    }

    fn from_timestamp(&self, ts: &prost_types::Timestamp) -> NaiveDateTime {
        NaiveDateTime::from_timestamp_opt(ts.seconds, ts.nanos as u32).unwrap()
    }

    async fn convert_to_proto_profile(&self, db_patient: patient::Model) -> PatientProfile {
        PatientProfile {
            id: db_patient.id.to_string(),
            user_id: db_patient.user_id.to_string(),
            name: "".to_string(), // TODO: Get from users table
            email: "".to_string(), // TODO: Get from users table
            date_of_birth: Some(self.to_timestamp(db_patient.date_of_birth)),
            emergency_contact_name: db_patient.emergency_contact_name,
            emergency_contact_phone: db_patient.emergency_contact_phone,
            medical_conditions: db_patient.medical_conditions.unwrap_or_default(),
            current_medications: db_patient.current_medications.unwrap_or_default(),
            created_at: None, // TODO: Add timestamps
            updated_at: None,
        }
    }

    async fn convert_to_proto_medical_record(&self, db_record: medical_record::Model) -> MedicalRecord {
        MedicalRecord {
            id: db_record.id.to_string(),
            patient_id: db_record.patient_id.to_string(),
            doctor_id: db_record.doctor_id.to_string(),
            date: Some(self.to_timestamp(db_record.date)),
            diagnosis: db_record.diagnosis,
            treatment: db_record.treatment,
            notes: db_record.notes.unwrap_or_default(),
            created_at: Some(self.to_timestamp(db_record.created_at)),
            updated_at: Some(self.to_timestamp(db_record.updated_at)),
        }
    }

    async fn convert_to_proto_prescription(&self, db_prescription: prescription::Model) -> Prescription {
        Prescription {
            id: db_prescription.id.to_string(),
            patient_id: db_prescription.patient_id.to_string(),
            doctor_id: db_prescription.doctor_id.to_string(),
            medication_name: db_prescription.medication_name,
            dosage: db_prescription.dosage,
            frequency: db_prescription.frequency,
            start_date: Some(self.to_timestamp(db_prescription.start_date)),
            end_date: db_prescription.end_date.map(|d| self.to_timestamp(d)),
            instructions: db_prescription.instructions.unwrap_or_default(),
            status: db_prescription.status,
            created_at: Some(self.to_timestamp(db_prescription.created_at)),
            updated_at: Some(self.to_timestamp(db_prescription.updated_at)),
        }
    }

    async fn convert_to_proto_test_result(&self, db_result: test_result::Model) -> TestResult {
        TestResult {
            id: db_result.id.to_string(),
            patient_id: db_result.patient_id.to_string(),
            doctor_id: db_result.doctor_id.to_string(),
            test_name: db_result.test_name,
            test_date: Some(self.to_timestamp(db_result.test_date)),
            results: db_result.results,
            reference_range: db_result.reference_range.unwrap_or_default(),
            interpretation: db_result.interpretation.unwrap_or_default(),
            status: db_result.status,
            created_at: Some(self.to_timestamp(db_result.created_at)),
            updated_at: Some(self.to_timestamp(db_result.updated_at)),
        }
    }

    async fn convert_to_proto_appointment(&self, db_appointment: appointment::Model) -> Appointment {
        Appointment {
            id: db_appointment.id.to_string(),
            patient_id: db_appointment.patient_id.to_string(),
            doctor_id: db_appointment.doctor_id.to_string(),
            datetime: Some(self.to_timestamp(db_appointment.date_time)),
            duration: db_appointment.duration as i32,
            r#type: db_appointment.r#type,
            status: db_appointment.status,
            notes: db_appointment.notes.unwrap_or_default(),
            reason: db_appointment.reason,
            created_at: Some(self.to_timestamp(db_appointment.created_at)),
            updated_at: Some(self.to_timestamp(db_appointment.updated_at)),
        }
    }
}

#[async_trait]
impl PatientService for PatientServiceImpl {
    async fn get_patient_profile(
        &self,
        request: Request<GetPatientProfileRequest>,
    ) -> Result<Response<GetPatientProfileResponse>, TonicStatus> {
        let patient_id = request.into_inner().patient_id;
        let db = get_postgres_conn().await;

        match patient::Entity::find_by_id(Uuid::parse_str(&patient_id).unwrap())
            .one(&db)
            .await
            .unwrap()
        {
            Some(patient) => {
                let profile = self.convert_to_proto_profile(patient).await;
                Ok(Response::new(GetPatientProfileResponse {
                    profile: Some(profile),
                    status: Status::Ok as i32,
                }))
            }
            None => Ok(Response::new(GetPatientProfileResponse {
                profile: None,
                status: Status::UserNotFound as i32,
            })),
        }
    }

    async fn update_patient_profile(
        &self,
        request: Request<UpdatePatientProfileRequest>,
    ) -> Result<Response<UpdatePatientProfileResponse>, TonicStatus> {
        let req = request.into_inner();
        let db = get_postgres_conn().await;
        
        let patient = match patient::Entity::find_by_id(Uuid::parse_str(&req.patient_id).unwrap())
            .one(&db)
            .await
            .unwrap()
        {
            Some(p) => p,
            None => return Ok(Response::new(UpdatePatientProfileResponse {
                profile: None,
                status: Status::UserNotFound as i32,
            })),
        };

        let mut patient_active: patient::ActiveModel = patient.into();

        if let Some(name) = req.emergency_contact_name {
            patient_active.emergency_contact_name = Set(name);
        }
        if let Some(phone) = req.emergency_contact_phone {
            patient_active.emergency_contact_phone = Set(phone);
        }
        if let Some(conditions) = req.medical_conditions {
            patient_active.medical_conditions = Set(Some(conditions));
        }
        if let Some(medications) = req.current_medications {
            patient_active.current_medications = Set(Some(medications));
        }

        match patient_active.update(&db).await {
            Ok(updated_patient) => {
                let profile = self.convert_to_proto_profile(updated_patient).await;
                Ok(Response::new(UpdatePatientProfileResponse {
                    profile: Some(profile),
                    status: Status::Ok as i32,
                }))
            }
            Err(e) => {
                error!("Failed to update patient profile: {}", e);
                Ok(Response::new(UpdatePatientProfileResponse {
                    profile: None,
                    status: Status::InternalError as i32,
                }))
            }
        }
    }

    async fn list_medical_records(
        &self,
        request: Request<ListMedicalRecordsRequest>,
    ) -> Result<Response<ListMedicalRecordsResponse>, TonicStatus> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;
        let db = get_postgres_conn().await;

        let mut query = medical_record::Entity::find()
            .filter(medical_record::Column::PatientId.eq(Uuid::parse_str(&req.patient_id).unwrap()));

        // Get total count
        let total = query.clone().count(&db).await.unwrap();

        // Get paginated results
        let paginator = query
            .order_by_desc(medical_record::Column::Date)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut records = Vec::new();
        for record in paginator.fetch_page(page - 1).await.unwrap() {
            records.push(self.convert_to_proto_medical_record(record).await);
        }

        Ok(Response::new(ListMedicalRecordsResponse {
            records,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn list_prescriptions(
        &self,
        request: Request<ListPrescriptionsRequest>,
    ) -> Result<Response<ListPrescriptionsResponse>, TonicStatus> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;
        let db = get_postgres_conn().await;

        let mut query = prescription::Entity::find()
            .filter(prescription::Column::PatientId.eq(Uuid::parse_str(&req.patient_id).unwrap()));

        // Apply status filter if provided
        if !req.status.is_empty() {
            query = query.filter(prescription::Column::Status.eq(req.status));
        }

        let total = query.clone().count(&db).await.unwrap();
        let paginator = query
            .order_by_desc(prescription::Column::StartDate)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut prescriptions = Vec::new();
        for prescription in paginator.fetch_page(page - 1).await.unwrap() {
            prescriptions.push(self.convert_to_proto_prescription(prescription).await);
        }

        Ok(Response::new(ListPrescriptionsResponse {
            prescriptions,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn list_test_results(
        &self,
        request: Request<ListTestResultsRequest>,
    ) -> Result<Response<ListTestResultsResponse>, TonicStatus> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;
        let db = get_postgres_conn().await;

        let mut query = test_result::Entity::find()
            .filter(test_result::Column::PatientId.eq(Uuid::parse_str(&req.patient_id).unwrap()));

        if !req.status.is_empty() {
            query = query.filter(test_result::Column::Status.eq(req.status));
        }

        let total = query.clone().count(&db).await.unwrap();
        let paginator = query
            .order_by_desc(test_result::Column::TestDate)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut results = Vec::new();
        for result in paginator.fetch_page(page - 1).await.unwrap() {
            results.push(self.convert_to_proto_test_result(result).await);
        }

        Ok(Response::new(ListTestResultsResponse {
            results,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn list_appointments(
        &self,
        request: Request<ListAppointmentsRequest>,
    ) -> Result<Response<ListAppointmentsResponse>, TonicStatus> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;
        let db = get_postgres_conn().await;

        let mut query = appointment::Entity::find()
            .filter(appointment::Column::PatientId.eq(Uuid::parse_str(&req.patient_id).unwrap()));

        // Apply filters
        if !req.status.is_empty() {
            query = query.filter(appointment::Column::Status.eq(req.status));
        }

        if let Some(start_date) = req.start_date {
            let naive_dt = self.from_timestamp(&start_date);
            query = query.filter(appointment::Column::DateTime.gte(naive_dt));
        }

        if let Some(end_date) = req.end_date {
            let naive_dt = self.from_timestamp(&end_date);
            query = query.filter(appointment::Column::DateTime.lte(naive_dt));
        }

        let total = query.clone().count(&db).await.unwrap();
        let paginator = query
            .order_by_desc(appointment::Column::DateTime)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut appointments = Vec::new();
        for appointment in paginator.fetch_page(page - 1).await.unwrap() {
            appointments.push(self.convert_to_proto_appointment(appointment).await);
        }

        Ok(Response::new(ListAppointmentsResponse {
            appointments,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn book_appointment(
        &self,
        request: Request<BookAppointmentRequest>,
    ) -> Result<Response<BookAppointmentResponse>, TonicStatus> {
        let req = request.into_inner();
        let db = get_postgres_conn().await;

        // Create new appointment
        let appointment = appointment::ActiveModel {
            id: Set(Uuid::new_v4()),
            patient_id: Set(Uuid::parse_str(&req.patient_id).unwrap()),
            doctor_id: Set(Uuid::parse_str(&req.doctor_id).unwrap()),
            date_time: Set(self.from_timestamp(&req.datetime.unwrap())),
            duration: Set(30), // Default duration in minutes
            r#type: Set(req.r#type),
            status: Set("Scheduled".to_string()),
            notes: Set(None),
            reason: Set(req.reason),
            created_at: Set(Utc::now().naive_utc()),
            updated_at: Set(Utc::now().naive_utc()),
        };
        info!("Appointment: {:#?}", appointment);
        match appointment.insert(&db).await {
            Ok(new_appointment) => {
                info!("New appointment: {:#?}", new_appointment);
                let proto_appointment = self.convert_to_proto_appointment(new_appointment).await;
                Ok(Response::new(BookAppointmentResponse {
                    appointment: Some(proto_appointment),
                    status: Status::Ok as i32,
                }))
            }
            Err(e) => {
                error!("Failed to book appointment: {}", e);
                Ok(Response::new(BookAppointmentResponse {
                    appointment: None,
                    status: Status::InternalError as i32,
                }))
            }
        }
    }

    async fn cancel_appointment(
        &self,
        request: Request<CancelAppointmentRequest>,
    ) -> Result<Response<CancelAppointmentResponse>, TonicStatus> {
        let req = request.into_inner();
        let db = get_postgres_conn().await;

        let appointment = match appointment::Entity::find_by_id(Uuid::parse_str(&req.appointment_id).unwrap())
            .one(&db)
            .await
            .unwrap()
        {
            Some(a) => a,
            None => return Ok(Response::new(CancelAppointmentResponse {
                status: Status::InternalError as i32,
            })),
        };

        let mut appointment_active: appointment::ActiveModel = appointment.into();
        appointment_active.status = Set("Cancelled".to_string());
        appointment_active.notes = Set(Some(req.reason));
        appointment_active.updated_at = Set(Utc::now().naive_utc());

        match appointment_active.update(&db).await {
            Ok(_) => Ok(Response::new(CancelAppointmentResponse {
                status: Status::Ok as i32,
            })),
            Err(e) => {
                error!("Failed to cancel appointment: {}", e);
                Ok(Response::new(CancelAppointmentResponse {
                    status: Status::InternalError as i32,
                }))
            }
        }
    }
} 