use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use std::env;
use std::time::Instant;
use redis::Commands;
use tracing::info;
use tracing::log::warn;
use crate::controllers::initialize::get_redis_conn;

#[derive(Serialize, Deserialize, Debug)]
pub struct Claims{
    sub: String,
    exp: usize,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Token{
    uid: String,
    token: String,
}

impl Token{
    pub async fn get_cached_uid(token: &str) -> Option<String> {
        let res = get_redis_conn().await.as_mut().unwrap().get(format!("access_token:{}", token));
        if res.is_ok() { 
            let data: Option<String> = res.unwrap();
            return data
        }else { 
            warn!("Failed to get redis data {}", res.unwrap_err());
        }
        None
    }
    pub async fn get_access_token(uid: &str) -> Option<String> {
        let instant = Instant::now();
        let res =  get_redis_conn().await.as_mut().unwrap().get(format!("uid:{}", uid));
        info!("get_cached_uid:{} time {}", uid, instant.elapsed().as_millis());
        if res.is_ok() {
            let data: Option<String> = res.unwrap();
            return data
        }
        None
    }
    pub async fn insert_access_token(uid: &str, token: &str, duration: u64){
        if  let Err(e) = get_redis_conn().await.as_mut().unwrap().set_ex::<&str, &str, u64>(&format!("access_token:{}", token), uid, duration){
            warn!("Could not set access token to cache {}", e.to_string());
        }
        if  let Err(e) = get_redis_conn().await.as_mut().unwrap().set_ex::<&str, &str, u64>(&format!("uid:{}", uid), token, duration){
            warn!("Could not set uid to cache {}", e.to_string());
        }
    }
    pub async fn get_refresh_token(token: &str) -> Option<String> {
        let instant = Instant::now();
        let res =  get_redis_conn().await.as_mut().unwrap().get(format!("refresh_token:{}", token));
        info!("time to fetch {}", instant.elapsed().as_millis());
        if res.is_ok() {
            let data: Option<String> = res.unwrap();
            return data
        }
        None
    }
    pub async fn insert_refresh_token(uid: &str, token: &str, duration: u64){
        info!("Uid {} token {} duration {}", uid, token, duration);
        if  let Err(e) = get_redis_conn().await.as_mut().unwrap().set_ex::<&str, &str, u64>(&format!("refresh_token:{}", token), uid, duration){
            warn!("Could not set refresh token to cache {}", e.to_string());
        }
    }
    pub async fn new(uid: String, token: String) -> Token{
        let  res = Self {uid: uid.clone(), token: token.clone()};
        Self::insert_access_token(&uid, &token, 3600).await;
        res
    }
}

impl Claims{
    pub async fn new(uid: &str)->Self{
        let ttl = env::var("JWT_TTL").expect("JWT_TTL must be set!!!")
            .parse::<i64>().unwrap();
        Self{ sub: uid.to_string(), exp: (Utc::now() + Duration::hours(ttl)).timestamp() as usize}
    }

    pub async fn generate_jwt(&self) -> Result<String, jsonwebtoken::errors::Error> {
        let key = env::var("JWT_KEY").expect("JWT_KEY must be set!!!");
        encode(
            &Header::default(),
            &self,
            &EncodingKey::from_secret(key.as_bytes()), // secret key should be stored securely
        )
    }
}


impl Claims{
    pub async fn uid(&self) -> String {self.sub.clone()}
    pub async fn exp(&self) -> usize{self.exp}
}