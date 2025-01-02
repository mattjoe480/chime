use std::ops::Add;
use std::sync::Arc;
use std::time::SystemTime;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tonic::{async_trait, Request, Response, Status};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use tracing::info;
use crate::model::credentials;
use crate::db::users::User;
use crate::types;
use crate::types::auth_server::Auth;
use crate::types::{AuthToken, Credentials, RefreshToken, Revoke, Token};

lazy_static!{
    static ref jwt_secret_key: Arc<String> = Arc::new(std::env::var("JWT_KEY")
        .unwrap_or("dev".to_string()));
    static ref jwt_secret_refresh_key: Arc<String> = Arc::new(std::env::var("JWT_REFRESH_KEY")
        .unwrap_or("dev".to_string()));
    static ref access_token_ttl: Arc<String> = Arc::new(std::env::var("JWT_ACCESS_TOKEN_TTL")
        .unwrap_or("1".to_string()));
    static ref refresh_token_ttl: Arc<String> = Arc::new(std::env::var("JWT_TOKEN_TOKEN_TTL")
        .unwrap_or("720".to_string()));
}

pub struct AuthServerImpl;
#[derive(Serialize, Deserialize, Debug)]
struct AccessTokenClaims {
    sub: String,        // Subject (user ID)
    exp: usize,         // Expiration time (Unix timestamp)
    iat: usize,         // Issued at (Unix timestamp)
}
impl AccessTokenClaims {
    pub fn new(sub: &str) -> Self {
        let current_time = Utc::now();
        let exp_time = current_time + Duration::hours(refresh_token_ttl
            .parse().expect("Invalid refresh token ttl"));
        Self{
            sub: sub.to_string(),
            exp: exp_time.timestamp() as usize,
            iat: current_time.timestamp() as usize,
        }
    }
    pub fn token(&self) -> String {
        let header = Header::default();
        let encoding_key = EncodingKey::from_secret(jwt_secret_refresh_key.as_bytes());
        encode(&header, self, &encoding_key).expect("Error creating access token")
    } 
}

#[derive(Serialize, Deserialize, Debug)]
struct RefreshTokenClaims {
    sub: String,        // Subject (user ID)
    exp: usize,         // Expiration time (Unix timestamp)
    iat: usize,         // Issued at (Unix timestamp)
    client_id: String,  // Client ID that issued the refresh token
}
impl RefreshTokenClaims {
    pub fn new(sub: &str, client_id: &str) -> Self {
        let current_time = Utc::now();
        let exp_time = current_time + Duration::hours(refresh_token_ttl
            .parse().expect("Invalid refresh token ttl"));
        Self{
            sub: sub.to_string(),
            exp: exp_time.timestamp() as usize,
            iat: current_time.timestamp() as usize,
            client_id: client_id.to_string(),
        }
    }
    pub fn token(&self) -> String {
        let header = Header::default();
        let encoding_key = EncodingKey::from_secret(jwt_secret_refresh_key.as_bytes());
        encode(&header, self, &encoding_key).expect("Error creating access token")
    }
}

#[async_trait]
impl Auth for AuthServerImpl {
    async fn auth(&self, request: Request<Credentials>) -> Result<Response<Token>, Status> {
        let cred = request.into_inner();
        if let Some(user) = User::find_by_email(&cred.email).await{
            if !user.verify_password(&cred.password).await { 
                return Self::error(types::Status::InvalidCredentials, "InvalidCredentials Username/Password");
            }
            let attl = access_token_ttl.parse()
                .expect("Invalid access token ttl");
            let rtll = refresh_token_ttl.parse()
                .expect("Invalid refresh token ttl");
            let access_claim = AccessTokenClaims::new(&user.id.to_string());
            let refresh_claim = RefreshTokenClaims::new(&user.id.to_string(), &cred.client_id);
            let(access_token, refresh_token) = (access_claim.token(), refresh_claim.token());
            let fut =self.store_all(user.id.to_string(), access_token.clone(), refresh_token.clone(), attl, rtll);
            let current_time = SystemTime::now();
            let access_token_expiration = prost_types::Timestamp::from(current_time.add(
                std::time::Duration::from_hours(attl)
            ));
            let refresh_token_expiration = prost_types::Timestamp::from(current_time.add(
                std::time::Duration::from_hours(rtll)));
            fut.await;
            Ok(Response::new(Token{
                uid: user.id.to_string(),
                email: user.email, 
                access_token,
                refresh_token,
                status: 0,
                error_message: "".to_string(),
                access_token_expiration: Some(access_token_expiration),
                refresh_token_expiration: Some(refresh_token_expiration),
                mfa_required: false,
                last_login: None,
            }))
        }
        else {
            Self::error(types::Status::InvalidCredentials, "InvalidCredentials Username/Password")
        }
    }

    async fn token(&self, request: Request<RefreshToken>) -> Result<Response<AuthToken>, Status> {
        let refresh_token = request.into_inner();
        if let Some(uid) = credentials::Token::get_refresh_token(&refresh_token.token).await{
            info!("User with uid {} found", &uid);
            let token = AccessTokenClaims::new(&uid).token();
            return Ok(Response::new(AuthToken{
                token,
                status: 0,
                error_message: "".to_string(),
            }));
            
        }
        Ok(Response::new(AuthToken{
            token: "".to_string(),
            status: 3,
            error_message: "Please sign-in once more".to_string(),
        }))
    }

    async fn revoke(&self, request: Request<RefreshToken>) -> Result<Response<Revoke>, Status> {
        Err(Status::unimplemented("Not yet implemented"))
    }
}

impl AuthServerImpl {
    fn error(status: types::Status, msg: &str) -> Result<Response<Token>, Status>{
        let null = "".to_string();
        Ok(Response::new(Token{
            uid: null.clone(),
            email:null.clone(),
            access_token: null.clone(),
            refresh_token: null,
            status: status.into(),
            error_message: msg.to_string(),
            access_token_expiration: None,
            refresh_token_expiration: None,
            mfa_required: false,
            last_login: None,
        })) 
    }
    async fn store_all(&self, uid: String, access_token: String,
                       refresh_token: String, atll: u64, rtll: u64){
        credentials::Token::insert_access_token(&uid, &access_token, atll * (60 * 60) ).await;
        credentials::Token::insert_refresh_token(&uid, &refresh_token, rtll * (60 * 60)).await;
    }
}