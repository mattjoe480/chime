use std::time::Instant;
use argon2::{password_hash, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use mongodb::bson::{doc, DateTime};
use mongodb::{Collection, IndexModel};
use serde::{Deserialize, Serialize};
use tracing::{info, warn};
use futures::TryStreamExt;
use mongodb::options::IndexOptions;
use tracing::log::error;
use crate::controllers::initialize::get_mongodb_conn;

#[derive(Serialize, Deserialize)]
pub struct User{
    pub name:String,
    pub email:String,
    password:String,
    pub display_name:String,
    pub uid: String,
    pub register_date: String
}

pub async fn create_user_index(conn: Collection<User>) -> mongodb::error::Result<()> {
    let index_model_uid = IndexModel::builder()
        .keys(doc! { "uid": 1 })
        .options(IndexOptions::builder().unique(true).build()) // Optional: Unique index for `uid`
        .build();

    let index_model_email = IndexModel::builder()
        .keys(doc! { "email": 1 }) // Ascending order
        .options(IndexOptions::builder().unique(true).build()) // Optional: Unique index for `email`
        .build();

    // Create a compound index on `uid` and `email`
    let index_model_compound = IndexModel::builder()
        .keys(doc! { "uid": 1, "email": 1 }) // Compound index (ascending order for both fields)
        .options(IndexOptions::builder().unique(true).build()) // Optional: Unique compound index
        .build();

    // Create indexes in the collection
    let _result = conn.create_indexes(vec![
        index_model_uid,
        index_model_email,
        index_model_compound,
    ]).await?;
    Ok(())

}
async fn get_db_conn() -> Collection<User>{
    get_mongodb_conn().await.client.database("chat").collection("users")
}

impl User {

    pub async fn get_all_users() -> Vec<User> {
        let db = get_db_conn().await;
        let mut data = db.find(doc! {}).await.unwrap();
        let mut users = Vec::new();
        while let Some(result) =data.try_next().await.unwrap() {
            users.push(result);
        }
        users
    }
    pub async fn find_by_uid(uid: &str)->Result<User, ()>{
        let db = get_db_conn().await;
        match db.find_one(doc! {"uid": uid}).await{
            Ok(user) => {
                if let Some(item) = user {
                    info!("User found with uid: {}", uid);
                    Ok(item)
                }else {
                    warn!("User with uid {} not found", uid);
                    Err(())
                }
            }
            Err(_) => {
                warn!("User with uid {} not found", uid);
                Err(())
            }
        }
    }
    pub async fn find_by_email(email: &str)->Result<User, ()>{
        let time = Instant::now();
        let db = get_db_conn().await;
        info!("Time to get conn {}", time.elapsed().as_millis());
        match db.find_one(doc! {"email": email}).await{
            Ok(user) => {
                if let Some(item) = user {
                    info!("User found with email: {} time to fetch {}", email, time.elapsed().as_millis());
                    Ok(item)
                }else {
                    warn!("User with email {} not found time to fetch {}", email, time.elapsed().as_millis());
                    Err(())
                }
            }
            Err(_) => {
                warn!("User with email {} not found time to fetch {}", email, time.elapsed().as_millis());
                Err(())
            }
        }
    }
    pub async fn add(&self){
        match get_db_conn().await.insert_one(self).await{
            Ok(res ) => {
                info!("User added with name: {}", res.inserted_id);
            }
            Err(_) => {
                warn!("Cannot insert user with name: {}", self.uid);
            }
        }
    }
    async fn hash_password(password: String) -> Result<String, password_hash::Error>{
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        match argon2.hash_password(password.as_bytes(), &salt){
            Ok(hashed_password) => { Ok(hashed_password.to_string()) }
            Err(e) => Err(e)
        }
    }
    pub async fn verify_password(&self, password: &str) -> bool{
        match PasswordHash::new(&self.password) {
            Ok(hashed_password) => {
                Argon2::default().verify_password(password.as_bytes(), &hashed_password).is_ok()
            }
            Err(e) => {
                error!("Cannot verify password: {}", e);
                false
            }
        }
        
    }
    pub async fn new(name: String, email:String, password:String, display_name: String) -> User{
        let uid =  uuid::Uuid::new_v4().to_string();
        match Self::find_by_uid(&uid).await{
            Ok(_n) => {
                warn!("Duplicate uid {} generated calling new", uid);
                Box::pin(User::new(name, email, password, display_name)).await
            }
            Err(_e) => {
                info!("User added successfully with {}", uid);
                let password = Self::hash_password(password.clone()).await.unwrap();
                Self {
                    name,
                    email,
                    password,
                    display_name,
                    uid,
                    register_date: DateTime::now().to_string(),
                }
            }
        }
    }
}

impl User {
    async fn name(&self) -> String {
        self.name.clone()
    }
    async fn email(&self) -> String {
        self.email.clone()
    }
    async fn display_name(&self) -> String {
        self.display_name.clone()
    }
    async fn uid(&self) -> String {
        self.uid.clone()
    }
}