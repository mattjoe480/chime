use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create Medical Records Table
        manager
            .create_table(
                Table::create()
                    .table(MedicalRecord::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(MedicalRecord::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(ColumnDef::new(MedicalRecord::PatientId).uuid().not_null())
                    .col(ColumnDef::new(MedicalRecord::DoctorId).uuid().not_null())
                    .col(ColumnDef::new(MedicalRecord::Date).date().not_null())
                    .col(ColumnDef::new(MedicalRecord::Diagnosis).text().not_null())
                    .col(ColumnDef::new(MedicalRecord::Treatment).text().not_null())
                    .col(ColumnDef::new(MedicalRecord::Notes).text())
                    .col(ColumnDef::new(MedicalRecord::CreatedAt).timestamp().not_null())
                    .col(ColumnDef::new(MedicalRecord::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_medical_record_patient")
                            .from(MedicalRecord::Table, MedicalRecord::PatientId)
                            .to(Patient::Table, Patient::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create Prescriptions Table
        manager
            .create_table(
                Table::create()
                    .table(Prescription::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Prescription::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(ColumnDef::new(Prescription::PatientId).uuid().not_null())
                    .col(ColumnDef::new(Prescription::DoctorId).uuid().not_null())
                    .col(ColumnDef::new(Prescription::MedicationName).string().not_null())
                    .col(ColumnDef::new(Prescription::Dosage).string().not_null())
                    .col(ColumnDef::new(Prescription::Frequency).string().not_null())
                    .col(ColumnDef::new(Prescription::StartDate).date().not_null())
                    .col(ColumnDef::new(Prescription::EndDate).date())
                    .col(ColumnDef::new(Prescription::Instructions).text())
                    .col(ColumnDef::new(Prescription::Status).string().not_null())
                    .col(ColumnDef::new(Prescription::CreatedAt).timestamp().not_null())
                    .col(ColumnDef::new(Prescription::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_prescription_patient")
                            .from(Prescription::Table, Prescription::PatientId)
                            .to(Patient::Table, Patient::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create Test Results Table
        manager
            .create_table(
                Table::create()
                    .table(TestResult::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TestResult::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(ColumnDef::new(TestResult::PatientId).uuid().not_null())
                    .col(ColumnDef::new(TestResult::DoctorId).uuid().not_null())
                    .col(ColumnDef::new(TestResult::TestName).string().not_null())
                    .col(ColumnDef::new(TestResult::TestDate).date().not_null())
                    .col(ColumnDef::new(TestResult::Results).text().not_null())
                    .col(ColumnDef::new(TestResult::ReferenceRange).text())
                    .col(ColumnDef::new(TestResult::Interpretation).text())
                    .col(ColumnDef::new(TestResult::Status).string().not_null())
                    .col(ColumnDef::new(TestResult::CreatedAt).timestamp().not_null())
                    .col(ColumnDef::new(TestResult::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_test_result_patient")
                            .from(TestResult::Table, TestResult::PatientId)
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
                    .name("idx_medical_records_patient")
                    .table(MedicalRecord::Table)
                    .col(MedicalRecord::PatientId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_prescriptions_patient")
                    .table(Prescription::Table)
                    .col(Prescription::PatientId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_test_results_patient")
                    .table(TestResult::Table)
                    .col(TestResult::PatientId)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order of creation
        manager
            .drop_table(Table::drop().table(TestResult::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Prescription::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(MedicalRecord::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum MedicalRecord {
    Table,
    Id,
    PatientId,
    DoctorId,
    Date,
    Diagnosis,
    Treatment,
    Notes,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Prescription {
    Table,
    Id,
    PatientId,
    DoctorId,
    MedicationName,
    Dosage,
    Frequency,
    StartDate,
    EndDate,
    Instructions,
    Status,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum TestResult {
    Table,
    Id,
    PatientId,
    DoctorId,
    TestName,
    TestDate,
    Results,
    ReferenceRange,
    Interpretation,
    Status,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Patient {
    Table,
    Id,
}
