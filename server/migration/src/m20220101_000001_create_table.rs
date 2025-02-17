use sea_orm::{EnumIter, Iterable};
use sea_orm_migration::prelude::extension::postgres::Type;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.has_table("Users").await? {
            println!("Users Table already exists");
            return Ok(());
        }

        println!("Creating Users Table");
        let db = manager.get_connection();

        // Create role enum with proper values in lowercase
        db.execute_unprepared("CREATE TYPE role AS ENUM ('admin', 'user', 'none')")
            .await
            .expect("Failed to create role enum");

        db.execute_unprepared(
            "
        CREATE TABLE IF NOT EXISTS Users (
            Id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            Name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Password TEXT,
            Provider TEXT NOT NULL DEFAULT 'local',
            ProviderUid TEXT,
            RegisterDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            Role role NOT NULL DEFAULT 'none'  -- Default role set to none
            );",
        )
        .await
        .expect("Failed to create users table");

        db.execute_unprepared("CREATE INDEX idx_users_id ON Users (Id);")
            .await
            .expect("Failed to create users index email");

        db.execute_unprepared("CREATE INDEX idx_users_email ON Users (Email);")
            .await
            .expect("Failed to create users index email");

        db.execute_unprepared("INSERT INTO Users (Name, Email, Password, Provider, Role)
                    VALUES ('Matthew', 'matthew@gmail.com', '$argon2id$v=19$m=19456,t=2,p=1$O/gVin1kDsoLy4JCxTkvTw$qm3iHw/FsaHHJ1dkIh02lK2eVv7py/8Of7XoeP+ZP/I', 'local', 'admin')")
      .await.expect("Failed to insert user 'Users'");
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        manager
            .drop_type(Type::drop().name(Alias::new("Role")).to_owned())
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_users_id") // Name of the index to drop
                    .table(User::Users)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(User::Users).to_owned())
            .await
    }
}

#[derive(EnumIter, DeriveIden)]
pub enum Roles {
    Admin,
    Patient,
    Doctor,
    None,
}

#[derive(DeriveIden)]
enum User {
    Users,
    Id,
    Name,
    Email,
    Password,
    Provider,
    ProviderUid,
    RegisterDate,
    Role,
}
