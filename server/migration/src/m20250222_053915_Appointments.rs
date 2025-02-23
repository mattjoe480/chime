use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create Appointments Table
        manager
            .create_table(
                Table::create()
                    .table(Appointment::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Appointment::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(ColumnDef::new(Appointment::PatientId).uuid().not_null())
                    .col(ColumnDef::new(Appointment::DoctorId).uuid().not_null())
                    .col(ColumnDef::new(Appointment::DateTime).timestamp().not_null())
                    .col(ColumnDef::new(Appointment::Duration).integer().not_null()) // in minutes
                    .col(ColumnDef::new(Appointment::Type).string().not_null()) // e.g., "Consultation", "Follow-up", "Check-up"
                    .col(ColumnDef::new(Appointment::Status).string().not_null()) // e.g., "Scheduled", "Completed", "Cancelled"
                    .col(ColumnDef::new(Appointment::Notes).text())
                    .col(ColumnDef::new(Appointment::Reason).text().not_null())
                    .col(ColumnDef::new(Appointment::CreatedAt).timestamp().not_null())
                    .col(ColumnDef::new(Appointment::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_appointment_patient")
                            .from(Appointment::Table, Appointment::PatientId)
                            .to(Patient::Table, Patient::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create indexes for better query performance
        manager
            .create_index(
                Index::create()
                    .name("idx_appointments_patient")
                    .table(Appointment::Table)
                    .col(Appointment::PatientId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_appointments_doctor")
                    .table(Appointment::Table)
                    .col(Appointment::DoctorId)
                    .to_owned(),
            )
            .await?;

        // Create composite index for datetime and doctor
        manager
            .create_index(
                Index::create()
                    .name("idx_appointments_doctor_datetime")
                    .table(Appointment::Table)
                    .col(Appointment::DoctorId)
                    .col(Appointment::DateTime)
                    .to_owned(),
            )
            .await?;

        // Create index for status and datetime
        manager
            .create_index(
                Index::create()
                    .name("idx_appointments_status_datetime")
                    .table(Appointment::Table)
                    .col(Appointment::Status)
                    .col(Appointment::DateTime)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Appointment::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Appointment {
    Table,
    Id,
    PatientId,
    DoctorId,
    DateTime,
    Duration,
    Type,
    Status,
    Notes,
    Reason,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Patient {
    Table,
    Id,
} 