use crate::controllers::initialize::get_postgres_conn;
use crate::db::users::User;
use crate::entity;
use crate::entity::roles::{ActiveModel, Entity, Model};
use crate::entity::sea_orm_active_enums::Usertype;
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, ColumnTrait, DbErr, EntityTrait, QueryFilter};
use tracing::log::{error, info};

pub struct Roles;

impl Roles {
    pub async fn insert(email: String, roles: Usertype) -> Result<(), String> {
        let db = get_postgres_conn();
        if User::find_by_email(&email).await.is_none() {
            return Err(String::from("Email does not exists"));
        }
        if Roles::get_role(email.to_string()).await.is_some() {
            return Err(String::from("Role already exists"));
        }
        let role = ActiveModel {
            email: Set(email.to_string()),
            role: Set(roles),
        };
        if let Err(err) = role.insert(&db.await).await {
            error!("Failed to insert role. Error: {:?}", err);
            return Err(err.to_string());
        }
        info!("Role inserted successfully {}", email);
        Ok(())
    }
    pub async fn get_role(email: String) -> Option<Usertype> {
        let db = get_postgres_conn();
        let res = Entity::find()
            .filter(entity::roles::Column::Email.contains(email))
            .all(&db.await)
            .await;
        match res {
            Ok(role) => {
                if role.is_empty() {
                    return None;
                }
                Some(role.first().unwrap().to_owned().role)
            }
            Err(err) => {
                error!("Failed to get role. Error: {:?}", err);
                None
            }
        }
    }
}

impl From<i32> for Usertype {
    fn from(item: i32) -> Self {
        match item {
            1 => Usertype::Patient,
            2 => Usertype::Doctor,
            _ => Usertype::Patient,
        }
    }
}
