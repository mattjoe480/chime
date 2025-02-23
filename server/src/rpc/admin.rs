use crate::controllers::initialize::get_postgres_conn;
use crate::entity::{doctor, patient, users};
use crate::types::admin::{
    admin_service_server::AdminService, Doctor, GetDoctorDetailsRequest,
    GetDoctorDetailsResponse, ListDoctorsRequest, ListDoctorsResponse, ListPatientsRequest,
    ListPatientsResponse, Patient, VerifyDoctorRequest, VerifyDoctorResponse,
    GetPatientDetailsRequest, GetPatientDetailsResponse,
    ListUsersRequest, ListUsersResponse, UpdateUserRequest, UpdateUserResponse, AdminUser,
};
use crate::types::auth::Status;
use sea_orm::{ActiveEnum, ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, Set};
use tonic::{async_trait, Request, Response};
use tracing::error;

pub struct AdminServiceImpl;

impl AdminServiceImpl {

    async fn convert_to_proto_doctor(&self, db_doctor: doctor::Model) -> Doctor {
        let db = get_postgres_conn().await;
        let user = users::Entity::find_by_id(db_doctor.user_id)
            .one(&db)
            .await
            .unwrap()
            .unwrap();

        Doctor {
            id: db_doctor.id.to_string(),
            name: user.name,
            email: user.email,
            is_verified: false, // TODO: Add is_verified to doctor table
            specialization: format!("{:?}", db_doctor.specialization),
            license_number: db_doctor.medical_license,
            experience: db_doctor.years_of_experience.to_string(),
            certificates: vec![],
            created_at: None, // TODO: Add timestamps to doctor table
            updated_at: None,
            is_active: true, // TODO: Add is_active to doctor table
        }
    }

    async fn convert_to_proto_patient(&self, db_patient: patient::Model) -> Patient {
        let db = get_postgres_conn().await;
        let user = users::Entity::find_by_id(db_patient.user_id)
            .one(&db)
            .await
            .unwrap()
            .unwrap();

        Patient {
            id: db_patient.id.to_string(),
            name: user.name,
            email: user.email,
            medical_history: format!(
                "Medical Conditions: {}\nCurrent Medications: {}", 
                db_patient.medical_conditions.unwrap_or_default(),
                db_patient.current_medications.unwrap_or_default()
            ),
            created_at: None, // TODO: Add timestamps
            updated_at: None,
            is_active: true, // TODO: Add is_active field
        }
    }

    async fn convert_to_proto_admin_user(&self, db_user: users::Model) -> AdminUser {
        AdminUser {
            id: db_user.id.to_string(),
            name: db_user.name,
            email: db_user.email,
            role: db_user.role.to_value(),
            is_active: true, // TODO: Add is_active to users table
            created_at: None, // TODO: Add timestamps
            updated_at: None,
            provider: db_user.provider,
        }
    }
}

#[async_trait]
impl AdminService for AdminServiceImpl {
    async fn list_doctors(
        &self,
        request: Request<ListDoctorsRequest>,
    ) -> Result<Response<ListDoctorsResponse>, tonic::Status> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;
        let db = get_postgres_conn().await;

        let mut query = doctor::Entity::find();

        // Apply filters
        if !req.search.is_empty() {
            // TODO: Implement search across related user fields
        }

        if !req.specialization.is_empty() {
            query = query.filter(doctor::Column::Specialization.eq(req.specialization));
        }

        query = query.filter(doctor::Column::IsVerified.eq(req.verification_status));

        // Get total count
        let total = query.clone().count(&db).await.unwrap();

        // Get paginated results
        let paginator = query
            .order_by_asc(doctor::Column::Id)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();
        
        let mut doctors = Vec::new();
        for doctor in paginator.fetch_page(page - 1).await.unwrap() {
            doctors.push(self.convert_to_proto_doctor(doctor).await);
        }

        Ok(Response::new(ListDoctorsResponse {
            doctors,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn get_doctor_details(
        &self,
        request: Request<GetDoctorDetailsRequest>,
    ) -> Result<Response<GetDoctorDetailsResponse>, tonic::Status> {
        let doctor_id = request.into_inner().doctor_id;
        let db = get_postgres_conn().await;
        match doctor::Entity::find_by_id(uuid::Uuid::parse_str(&doctor_id).unwrap())
            .one(&db)
            .await
            .unwrap()
        {
            Some(doctor) => {
                let proto_doctor = self.convert_to_proto_doctor(doctor).await;
                Ok(Response::new(GetDoctorDetailsResponse {
                    doctor: Some(proto_doctor),
                    status: Status::Ok as i32,
                }))
            }
            None => Ok(Response::new(GetDoctorDetailsResponse {
                doctor: None,
                status: Status::UserNotFound as i32,
            })),
        }
    }

    async fn verify_doctor(
        &self,
        request: Request<VerifyDoctorRequest>,
    ) -> Result<Response<VerifyDoctorResponse>, tonic::Status> {
        let req = request.into_inner();
        let doctor_id = uuid::Uuid::parse_str(&req.doctor_id).unwrap();
        let db = get_postgres_conn().await;
        let doctor = match doctor::Entity::find_by_id(doctor_id)
            .one(&db)
            .await
            .unwrap()
        {
            Some(d) => d,
            None => {
                return Ok(Response::new(VerifyDoctorResponse {
                    doctor: None,
                    status: Status::UserNotFound as i32,
                }))
            }
        };

        // Convert to active model
        let mut doctor_active: doctor::ActiveModel = doctor.into();
        
        // TODO: Add is_verified field to doctor table
        // doctor_active.is_verified = Set(req.verify);
        let db = get_postgres_conn().await;
        match doctor_active.update(&db).await {
            Ok(updated_doctor) => {
                let proto_doctor = self.convert_to_proto_doctor(updated_doctor).await;
                Ok(Response::new(VerifyDoctorResponse {
                    doctor: Some(proto_doctor),
                    status: Status::Ok as i32,
                }))
            }
            Err(e) => {
                error!("Failed to update doctor verification status: {}", e);
                Ok(Response::new(VerifyDoctorResponse {
                    doctor: None,
                    status: Status::InternalError as i32,
                }))
            }
        }
    }

    async fn list_patients(
        &self,
        request: Request<ListPatientsRequest>,
    ) -> Result<Response<ListPatientsResponse>, tonic::Status> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;

        let mut query = patient::Entity::find();

        // Apply search filter if provided
        if !req.search.is_empty() {
            // TODO: Implement search by joining with users table
        }

        // Get total count
        let db = get_postgres_conn().await;
        let total = query.clone().count(&db).await.unwrap();

        // Get paginated results
        let paginator = query
            .order_by_asc(patient::Column::Id)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut patients = Vec::new();
        for patient in paginator.fetch_page(page - 1).await.unwrap() {
            patients.push(self.convert_to_proto_patient(patient).await);
        }

        Ok(Response::new(ListPatientsResponse {
            patients,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn get_patient_details(
        &self,
        request: Request<GetPatientDetailsRequest>,
    ) -> Result<Response<GetPatientDetailsResponse>, tonic::Status> {
        let patient_id = request.into_inner().patient_id;
        let db = get_postgres_conn().await;
        match patient::Entity::find_by_id(uuid::Uuid::parse_str(&patient_id).unwrap())
            .one(&db)
            .await
            .unwrap()
        {
            Some(patient) => {
                let proto_patient = self.convert_to_proto_patient(patient).await;
                Ok(Response::new(GetPatientDetailsResponse {
                    patient: Some(proto_patient),
                    status: Status::Ok as i32,
                }))
            }
            None => Ok(Response::new(GetPatientDetailsResponse {
                patient: None,
                status: Status::UserNotFound as i32,
            })),
        }
    }

    async fn list_users(
        &self,
        request: Request<ListUsersRequest>,
    ) -> Result<Response<ListUsersResponse>, tonic::Status> {
        let req = request.into_inner();
        let page = req.page as u64;
        let per_page = req.limit as u64;

        let mut query = users::Entity::find();

        // Apply filters
        if !req.search.is_empty() {
            query = query.filter(
                users::Column::Name
                    .contains(&req.search)
                    .or(users::Column::Email.contains(&req.search)),
            );
        }

        if !req.role_filter.is_empty() {
            query = query.filter(users::Column::Role.eq(req.role_filter));
        }

        let db = get_postgres_conn().await;
        let total = query.clone().count(&db).await.unwrap();
        let paginator = query
            .order_by_asc(users::Column::Name)
            .paginate(&db, per_page);
        let total_pages = paginator.num_pages().await.unwrap();

        let mut users = Vec::new();
        for user in paginator.fetch_page(page - 1).await.unwrap() {
            users.push(self.convert_to_proto_admin_user(user).await);
        }

        Ok(Response::new(ListUsersResponse {
            users,
            total: total as i32,
            page: page as i32,
            total_pages: total_pages as i32,
        }))
    }

    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<UpdateUserResponse>, tonic::Status> {
        let req = request.into_inner();
        let user_id = uuid::Uuid::parse_str(&req.user_id).unwrap();
        let db = get_postgres_conn().await;

        let user = match users::Entity::find_by_id(user_id).one(&db).await.unwrap() {
            Some(u) => u,
            None => {
                return Ok(Response::new(UpdateUserResponse {
                    user: None,
                    status: Status::UserNotFound as i32,
                }))
            }
        };

        let mut user_active: users::ActiveModel = user.clone().into();

        if let Some(name) = req.name {
            user_active.name = Set(name);
        }
        // if let Some(role) = req.role {
        //     user_active.role = Set(role);
        // }
        // TODO: Add is_active field to users table
        // if let Some(is_active) = req.is_active {
        //     user_active.is_active = Set(is_active);
        // }
        let db = get_postgres_conn().await;
        match user_active.update(&db).await {
            Ok(updated_user) => {
                let proto_user = self.convert_to_proto_admin_user(updated_user).await;
                Ok(Response::new(UpdateUserResponse {
                    user: Some(proto_user),
                    status: Status::Ok as i32,
                }))
            }
            Err(e) => {
                error!("Failed to update user: {}", e);
                Ok(Response::new(UpdateUserResponse {
                    user: None,
                    status: Status::InternalError as i32,
                }))
            }
        }
    }
}