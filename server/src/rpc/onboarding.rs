use crate::controllers::initialize::get_postgres_conn;
use crate::entity::sea_orm_active_enums::DoctorSpecialization;
use crate::entity::{doctor, patient};
use crate::types::onboarding;
use crate::types::onboarding::onboarding_request::Profile;
use crate::types::onboarding::*;
use chrono::NaiveDate;
use sea_orm::*;
use tonic::{Request, Response, Status};
use uuid::Uuid;

pub struct OnboardingServerImpl;

#[tonic::async_trait]
impl onboarding_server::Onboarding for OnboardingServerImpl {
    async fn complete_onboarding(
        &self,
        request: Request<OnboardingRequest>,
    ) -> Result<Response<OnboardingResponse>, Status> {
        let db = get_postgres_conn().await;

        let profile = request
            .into_inner()
            .profile
            .ok_or_else(|| Status::invalid_argument("Profile data is required"))?;

        match profile {
            Profile::Patient(patient_data) => {
                let patient_model = patient::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(Uuid::parse_str(&patient_data.user_id)
                        .map_err(|_| Status::invalid_argument("Invalid user ID format"))?),
                    date_of_birth: Set(NaiveDate::parse_from_str(
                        &patient_data.date_of_birth,
                        "%Y-%m-%d",
                    )
                    .map_err(|_| {
                        Status::invalid_argument("Invalid date format. Expected YYYY-MM-DD")
                    })?),
                    emergency_contact_name: Set(patient_data.emergency_contact_name),
                    emergency_contact_phone: Set(patient_data.emergency_contact_phone),
                    medical_conditions: Set(Some(patient_data.medical_conditions)),
                    current_medications: Set(Some(patient_data.current_medications)),
                };

                patient::Entity::insert(patient_model)
                    .exec(&db)
                    .await
                    .map_err(|e| {
                        Status::internal(format!("Failed to create patient profile: {}", e))
                    })?;
            }
            Profile::Doctor(doctor_data) => {
                let doctor_model = doctor::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(Uuid::parse_str(&doctor_data.user_id)
                        .map_err(|_| Status::invalid_argument("Invalid user ID format"))?),
                    medical_license: Set(doctor_data.medical_license),
                    is_verified: Set(false),
                    specialization: Set(DoctorSpecialization::from(doctor_data.specialization)),
                    years_of_experience: Set(doctor_data.years_of_experience),
                    hospital_affiliation: Set(doctor_data.hospital_affiliation),
                };

                doctor::Entity::insert(doctor_model)
                    .exec(&db)
                    .await
                    .map_err(|e| {
                        Status::internal(format!("Failed to create doctor profile: {}", e))
                    })?;
            }
        }

        Ok(Response::new(OnboardingResponse {
            status: onboarding::Status::Ok as i32,
            message: "Profile created successfully".to_string(),
        }))
    }
}

impl From<String> for DoctorSpecialization {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "general" => DoctorSpecialization::General,
            "cardiology" => DoctorSpecialization::Cardiology,
            "pediatrics" => DoctorSpecialization::Pediatrics,
            "orthopedics" => DoctorSpecialization::Orthopedics,
            _ => DoctorSpecialization::General, // Default to general if unknown
        }
    }
}
