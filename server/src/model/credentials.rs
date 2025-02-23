use crate::controllers::initialize::{get_postgres_conn, get_redis_conn};
use crate::entity::users;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use lazy_static::lazy_static;
use redis::{Commands, RedisError, RedisResult};
use sea_orm::EntityTrait;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::env;
use tracing::{debug, error};

lazy_static! {
    static ref secret: String = env::var("JWT_KEY").expect("JWT_KEY must be set!!!");
    static ref refresh_secret: String =
        env::var("JWT_REFRESH_KEY").expect("JWT_KEY must be set!!!");
    static ref jwt_ttl: String = env::var("JWT_TTL").unwrap_or("60".to_string());
    static ref jwt_refresh_ttl: String = env::var("JWT_REFRESH_TTL").unwrap_or("720".to_string());
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AccessTokenClaims {
    pub(crate) sub: String,
    pub(crate) role: String,
    pub(crate) exp: usize,
    pub(crate) iat: usize,
    aud: String,
    iss: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct RefreshTokenClaims {
    pub(crate) sub: String,
    pub(crate) exp: usize,
    pub(crate) iat: usize,
}

impl JwtToken for AccessTokenClaims {}
impl JwtToken for RefreshTokenClaims {}

impl AccessTokenClaims {
    pub async fn new(uid: &str) -> Self {
        let db = get_postgres_conn().await;
        let ttl = env::var("JWT_TTL")
            .expect("JWT_TTL must be set!!!")
            .parse::<i64>()
            .unwrap();

        let user = users::Entity::find_by_id(uuid::Uuid::parse_str(uid).unwrap())
            .one(&db)
            .await
            .unwrap()
            .unwrap();

        Self {
            sub: uid.to_string(),
            role: format!("{:?}", user.role).to_uppercase(),
            exp: (Utc::now() + Duration::minutes(ttl)).timestamp() as usize,
            iat: Utc::now().timestamp() as usize,
            aud: "localhost".to_string(),
            iss: "localhost".to_string(),
        }
    }
    pub fn jwt_token(&self) -> Option<String> {
        if let Ok(jwt) = AccessTokenClaims::encode_claims(self, &secret.to_string()) {
            Some(jwt)
        } else {
            None
        }
    }
    pub(crate) fn from_jwt(jwt: String) -> Result<AccessTokenClaims, bool> {
        debug!("jwt: {}", jwt);
        if let Ok(claims) = AccessTokenClaims::decode_claims(&jwt, &secret.to_string()) {
            Ok(claims.claims)
        } else {
            Err(false)
        }
    }
    pub(crate) async fn fetch(uid: &str) -> Option<String> {
        let res = AccessTokenClaims::get(&format!("access_token:{}", uid)).await;
        if res.is_ok() {
            let data: String = res.unwrap();
            return Some(data);
        }
        None
    }
    pub async fn set(&self) -> bool {
        if AccessTokenClaims::store(
            self,
            &format!("access_token:{}", &self.sub),
            (self.exp - self.iat) as u64,
        )
        .await
        .is_ok()
        {
            true
        } else {
            false
        }
    }
}

impl RefreshTokenClaims {
    pub async fn new(uid: &str) -> Self {
        let ttl = env::var("JWT_TTL")
            .expect("JWT_TTL must be set!!!")
            .parse::<i64>()
            .unwrap();
        Self {
            sub: uid.to_string(),
            exp: (Utc::now() + Duration::hours(ttl)).timestamp() as usize,
            iat: Utc::now().timestamp() as usize,
        }
    }
    pub fn jwt_token(&self) -> Option<String> {
        if let Ok(jwt) = RefreshTokenClaims::encode_claims(self, &secret.to_string()) {
            Some(jwt)
        } else {
            None
        }
    }
    pub fn from_jwt(jwt: String) -> Result<RefreshTokenClaims, bool> {
        if let Ok(claims) = RefreshTokenClaims::decode_claims(&jwt, &secret.to_string()) {
            Ok(claims.claims)
        } else {
            Err(false)
        }
    }
    pub(crate) async fn fetch(uid: &str) -> Option<String> {
        let res = RefreshTokenClaims::get(&format!("refresh_token:{}", uid)).await;
        if res.is_ok() {
            let data: String = res.unwrap();
            return Some(data);
        }
        None
    }
    pub async fn set(&self) -> bool {
        if RefreshTokenClaims::store(
            self,
            &format!("refresh_token{}", &self.sub),
            (self.exp - self.iat) as u64,
        )
        .await
        .is_ok()
        {
            true
        } else {
            false
        }
    }
    pub async fn revoke(&self) -> bool {
        if RefreshTokenClaims::store(
            &self,
            &format!("blocked_refresh_token{}", &self.jwt_token().unwrap()),
            (self.exp - self.iat) as u64,
        )
        .await
        .is_ok()
        {
            true
        } else {
            false
        }
    }
    pub async fn is_revoke(&self) -> bool {
        if RefreshTokenClaims::get(&format!(
            "blocked_refresh_token{}",
            &self.jwt_token().unwrap()
        ))
        .await
        .is_ok()
        {
            true
        } else {
            false
        }
    }
}

#[tonic::async_trait]
pub trait JwtToken: Serialize + for<'de> Deserialize<'de> {
    fn encode_claims(claims: &Self, token_secret: &str) -> jsonwebtoken::errors::Result<String> {
        let header = Header::new(jsonwebtoken::Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(token_secret.as_bytes());
        encode(&header, claims, &encoding_key)
    }
    fn decode_claims(
        token: &str,
        token_secret: &str,
    ) -> jsonwebtoken::errors::Result<TokenData<Self>> {
        let decoding_key = DecodingKey::from_secret(token_secret.as_bytes());
        let mut validation = Validation::new(jsonwebtoken::Algorithm::HS256);
        validation.aud = Some(HashSet::from(["localhost".to_string()]));
        decode::<Self>(token, &decoding_key, &validation)
    }
    async fn store(&self, key: &str, duration: u64) -> Result<(), RedisError> {
        if let Err(e) = get_redis_conn()
            .await
            .as_mut()
            .unwrap()
            .set_ex::<&str, &str, String>(key, &serde_json::to_string(self).unwrap(), duration)
        {
            error!("Refresh token revocation error: {}", e);
            Err(e)
        } else {
            Ok(())
        }
    }
    async fn get(key: &str) -> RedisResult<String> {
        get_redis_conn()
            .await
            .as_mut()
            .unwrap()
            .get::<&str, String>(key)
    }
}
