pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20250205_103441_role;
mod m20250205_125723_patient;
mod m20250205_125737_doctor;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20250205_103441_role::Migration),
            Box::new(m20250205_125723_patient::Migration),
            Box::new(m20250205_125737_doctor::Migration),
        ]
    }
}
