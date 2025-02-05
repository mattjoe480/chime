use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.has_table("Doctors").await? {
            println!("Doctors Table already exists");
            return Ok(());
        }

        println!("Creating Doctors Table");
        // Create specialization enum type
        let db = manager.get_connection();
        db.execute_unprepared(
            "CREATE TYPE doctor_specialization AS ENUM (
                'general',
                'cardiology',
                'pediatrics',
                'orthopedics'
            )",
        )
        .await?;

        manager
            .create_table(
                Table::create()
                    .table(Doctor::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Doctor::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                    )
                    .col(
                        ColumnDef::new(Doctor::UserId)
                            .uuid()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Doctor::MedicalLicense)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Doctor::Specialization)
                            .custom(Alias::new("doctor_specialization"))
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Doctor::YearsOfExperience)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Doctor::HospitalAffiliation)
                            .string()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_doctor_user")
                            .from(Doctor::Table, Doctor::UserId)
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
                    .name("idx_doctors_user_id")
                    .table(Doctor::Table)
                    .col(Doctor::UserId)
                    .to_owned(),
            )
            .await?;

        // Create an index on MedicalLicense for faster lookups
        manager
            .create_index(
                Index::create()
                    .name("idx_doctors_medical_license")
                    .table(Doctor::Table)
                    .col(Doctor::MedicalLicense)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop the table first
        manager
            .drop_table(Table::drop().table(Doctor::Table).to_owned())
            .await?;

        // Drop the enum type
        let db = manager.get_connection();
        db.execute_unprepared("DROP TYPE IF EXISTS doctor_specialization")
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Doctor {
    Table,
    Id,
    UserId,
    MedicalLicense,
    Specialization,
    YearsOfExperience,
    HospitalAffiliation,
}

#[derive(DeriveIden)]
enum User {
    Users,
    Id,
}
