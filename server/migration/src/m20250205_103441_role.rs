use crate::extension::postgres::Type;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.has_table("Roles").await? {
            return Ok(());
        }
        let db = manager.get_connection();
        db.execute_unprepared("CREATE TYPE USERTYPE AS ENUM ('admin', 'patient', 'doctor')")
            .await
            .expect("Failed to create ");
        db.execute_unprepared(
            "
        CREATE TABLE IF NOT EXISTS Roles (
            Email TEXT NOT NULL PRIMARY KEY,
            Role USERTYPE NOT NULL DEFAULT 'patient' 
            );",
        )
        .await
        .expect("Failed to create Role table");

        db.execute_unprepared("CREATE INDEX idx_role_email ON Users (Role);")
            .await
            .expect("Failed to create users index email");
        db.execute_unprepared(
            "INSERT INTO Roles (Email, Role)
                    VALUES ('matthew@gmail.com', 'admin')",
        )
        .await
        .expect("Failed to insert user 'Users'");
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_type(Type::drop().name(Alias::new("USERTYPE")).to_owned())
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_role_email") // Name of the index to drop
                    .table(Role::Roles)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Role::Roles).to_owned())
            .await
    }
}
#[derive(DeriveIden)]
enum Role {
    Roles,
    Email,
    Role,
}
