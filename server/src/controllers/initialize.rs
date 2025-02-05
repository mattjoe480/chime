use crate::db::Scylla;
use charybdis::scylla::{CachingSession, SessionBuilder};
use dotenv::dotenv;
use lazy_static::lazy_static;
use redis::{Client, Connection};
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::env;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{Mutex, MutexGuard};
use tracing::{debug, error, info};

lazy_static! {
    static ref jwt_ttl: String = env::var("JWT_TTL").unwrap_or("60".to_string());
    static ref jwt_secret_key: String = env::var("JWT_KEY").unwrap_or("dev".to_string());
    static ref redis_uri: String =
        env::var("REDIS_URI").unwrap_or("redis://127.0.0.1/".to_string());
    static ref redis_conn: Arc<Mutex<Option<Connection>>> = Arc::new(Mutex::new(None));
    static ref scylla_uri: String = env::var("SCYLLA_URL").unwrap_or("127.0.0.1:9042".to_string());
    static ref scylla_session: Arc<Mutex<Option<Scylla>>> = Arc::new(Mutex::new(None));
    static ref postgres_user: String = env::var("POSTGRES_USER").unwrap_or("chime".to_string());
    static ref postgres_conn: Arc<Mutex<Option<DatabaseConnection>>> = Arc::new(Mutex::new(None));
}

pub async fn connect_to_redis() -> Result<Connection, redis::RedisError> {
    let uri = redis_uri.clone();
    let redis = Client::open(uri);
    redis?.get_connection()
}
pub async fn init_redis() {
    let uri = redis_uri.clone();
    match Client::open(uri) {
        Ok(client) => match client.get_connection() {
            Ok(conn) => {
                let mut lock = redis_conn.lock().await;
                if lock.is_none() {
                    *lock = Some(conn);
                    info!("Is redis connected? {}", lock.is_some());
                }
            }
            Err(e) => panic!("Failed to connect to redis {}", e),
        },
        Err(e) => {
            panic!("could not connect to redis {}", e);
        }
    }
}

pub async fn get_redis_conn() -> MutexGuard<'static, Option<Connection>> {
    let lock = redis_conn.lock().await;
    lock
}

pub async fn get_jwt_secret_key() -> String {
    jwt_secret_key.clone()
}

pub async fn initialize_all() {
    dotenv().ok();
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::from_str(env::var("LOG_LEVEL").unwrap().as_str()).unwrap())
        .init();
    init_postgres().await.unwrap();
    init_db().await.unwrap();
    init_redis().await;
}

async fn init_db() -> Result<(), ()> {
    match SessionBuilder::new()
        .known_node(scylla_uri.clone())
        .build()
        .await
    {
        Ok(session) => {
            debug!("Connected to database successfully");
            let mut lock = scylla_session.lock().await;
            let cache = CachingSession::from(session, 2000);
            cache
                .get_session()
                .use_keyspace("chime", false)
                .await
                .unwrap();
            *lock = Some(Scylla { conn: cache.into() });
            Ok(())
        }
        Err(_) => {
            error!("Failed to connect to database");
            Err(())
        }
    }
}

pub async fn get_db() -> Arc<Mutex<Option<Scylla>>> {
    scylla_session.clone()
}

async fn init_postgres() -> Result<(), ()> {
    let conn_uri = format!(
        "postgres://{}:{}@{}",
        env::var("POSTGRES_USER").unwrap_or("chime".to_string()),
        env::var("POSTGRES_PASSWORD").unwrap_or("chime".to_string()),
        env::var("POSTGRES_URI").unwrap_or("178.16.138.165:5432/postgres".to_string())
    );
    let mut opt = ConnectOptions::new(conn_uri);
    opt.max_connections(100)
        .min_connections(5)
        .connect_timeout(Duration::from_secs(8))
        .acquire_timeout(Duration::from_secs(8))
        .idle_timeout(Duration::from_secs(8))
        .max_lifetime(Duration::from_secs(8))
        .sqlx_logging(true)
        .set_schema_search_path("public");
    let db = Database::connect(opt)
        .await
        .expect("Cannot connect to postgres database");
    let mut lock = postgres_conn.lock().await;
    *lock = Some(db);
    Ok(())
}

pub async fn get_postgres_conn() -> DatabaseConnection {
    postgres_conn
        .lock()
        .await
        .clone()
        .expect("Cannot connect to postgres database")
}
