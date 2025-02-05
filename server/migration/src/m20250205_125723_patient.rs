use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.has_table("Patients").await? {
            println!("Patients Table already exists");
            return Ok(());
        }

        println!("Creating Patients Table");
        manager
            .create_table(
                Table::create()
                    .table(Patient::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Patient::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(
                        ColumnDef::new(Patient::UserId)
                            .uuid()
                            .not_null()
                            .unique_key(),
                    )
                    .col(ColumnDef::new(Patient::DateOfBirth).date().not_null())
                    .col(
                        ColumnDef::new(Patient::EmergencyContactName)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Patient::EmergencyContactPhone)
                            .string()
                            .not_null(),
                    )
                    .col(ColumnDef::new(Patient::MedicalConditions).text())
                    .col(ColumnDef::new(Patient::CurrentMedications).text())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_patient_user")
                            .from(Patient::Table, Patient::UserId)
                            .to(User::Users, User::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create an index on UserId for faster lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_patients_user_id")
                    .table(Patient::Table)
                    .col(Patient::UserId)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Patient::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Patient {
    Table,
    Id,
    UserId,
    DateOfBirth,
    EmergencyContactName,
    EmergencyContactPhone,
    MedicalConditions,
    CurrentMedications,
}

#[derive(DeriveIden)]
enum User {
    Users,
    Id,
}
