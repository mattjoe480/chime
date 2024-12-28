use std::sync::Arc;
use dotenv::dotenv;
use lazy_static::lazy_static;
use redis::{Client, Connection};
use tokio::sync::{Mutex, MutexGuard};
use tracing::info;
use crate::db::{DatabaseCon};

lazy_static!{
    static ref mongodb_conn: Arc<Mutex<Option<DatabaseCon>>> = Arc::new(Mutex::new(None));
    static ref mongodb_uri: String = std::env::var("MONGODB_URI").unwrap_or("mongodb://localhost:27017".to_string());
    static ref jwt_ttl: String = std::env::var("JWT_TTL").unwrap_or("60".to_string());
    static ref jwt_secret_key: String = std::env::var("JWT_KEY").unwrap_or("dev".to_string());
    static ref redis_uri: String = std::env::var("REDIS_URI").unwrap_or("redis://127.0.0.1/".to_string());
    static ref redis_conn: Arc<Mutex<Option<Connection>>> = Arc::new(Mutex::new(None)); 
}

pub async fn init_database() {
    let dbc = DatabaseCon::new().await;
    let mut lock = mongodb_conn.lock().await;
    match lock.as_mut() {
        Some(_db)=>{},
        None =>{
            *lock = Some(dbc);
        },
    };
}

pub async fn connect_to_redis() -> Result<Connection, redis::RedisError> {
    let uri = redis_uri.clone();
    let redis = Client::open(uri);
    redis?.get_connection()
}
pub async fn init_redis(){
    let uri = redis_uri.clone();
    match Client::open(uri){
        Ok(client) => {
             match client.get_connection() { 
                 Ok(conn) => {
                     let mut lock = redis_conn.lock().await;
                     if lock.is_none() {
                         *lock = Some(conn);
                         info!("Is redis connected? {}", lock.is_some());
                     }
                 }
                 Err(e) => panic!("Failed to connect to redis {}", e),
             }
         },
         Err(e) =>{
             panic!("could not connect to redis {}", e);
         }
     }
    
}

pub async fn get_mongodb_conn() -> DatabaseCon {
    let mut lock = mongodb_conn.lock().await;
    match lock.as_mut() {
        Some(_db) => lock.clone().unwrap(),
        None =>{
            *lock = Some(DatabaseCon::new().await);
            lock.clone().unwrap()
        }
    }
}

pub async fn get_redis_conn() -> MutexGuard<'static, Option<Connection>> {
    let lock = redis_conn.lock().await;
    lock
}

pub async fn get_mongodb_uri() -> String {
    mongodb_uri.clone()
}
pub async fn get_jwt_ttl() -> String {
    jwt_ttl.clone()
}
pub async fn get_jwt_secret_key() -> String {
    jwt_secret_key.clone()
}

pub async fn initialize_all(){
    dotenv().ok();
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();
    init_database().await; 
    init_redis().await;
}
