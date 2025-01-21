use std::ops::Add;
use std::sync::Arc;
use std::time::{Instant, SystemTime};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use tonic::{async_trait, Request, Response, Status};
use tracing::{debug, error, info};
use crate::db::users::User;
use crate::model::credentials::{AccessTokenClaims, JwtToken, RefreshTokenClaims};
use crate::types;
use crate::types::auth_server::Auth;
use crate::types::{auth, AuthRequest, AuthToken, Credentials, RefreshToken, RegisterStatus, Revoke, Token, OAuth};
use crate::types::auth_request::Data;

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

#[async_trait]
impl Auth for AuthServerImpl {
    async fn auth(&self, request: Request<AuthRequest>) -> Result<Response<Token>, Status> {
        let auth_type = request.into_inner();
        if let Some(data) = auth_type.data {
            return match data {
                Data::Credentials(credentials) => {
                    self.token_credentials(credentials).await
                },
                Data::Oauth(oauth) => {
                    self.token_oauth(oauth).await
                }
            }
        }
      AuthServerImpl::error(types::Status::AuthFailed, "No credentials provided")
    }

    async fn token(&self, request: Request<RefreshToken>) -> Result<Response<AuthToken>, Status> {
        let refresh_token = request.into_inner();
        if let Ok(claims) = RefreshTokenClaims::from_jwt(refresh_token.token){
            if claims.is_revoke().await { 
                return Ok(
                    Response::new(AuthToken{ 
                        token: "".to_string(), 
                        status: types::Status::AuthFailed.into(), 
                        error_message: "Invalid token".to_string(),
                }))
            }
            info!("User with uid {} found", &claims.sub);
            let token = AccessTokenClaims::new(&claims.sub).await.jwt_token().unwrap();
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
        let req = request.into_inner();
        debug!("Revoking token {}", req.token);
        let mut res = Revoke::default();
        if RefreshTokenClaims::revoke(&RefreshTokenClaims::from_jwt(req.token).unwrap()).await{
            res.status = types::Status::AccountLocked.into();
            res.message = "Token revoked Successfully".to_string();
            Ok(Response::new(res)) 
        }
        else {
            res.status = types::Status::AuthFailed.into();
            res.message = "Token revocation failed".to_string();
            Ok(Response::new(res))
        }
        
       
    }


    async fn register(&self, request: Request<auth::User>) -> Result<Response<RegisterStatus>, Status> {
        debug!("Registering new user through gRPC");
        let data = request.into_inner();
        let result = User::new(
            data.name,
            data.email,
            Option::from(data.password),
            data.provider,
            Option::from(data.provider_uid))
            .await;

        match result {
            Ok(user) => {
                if let Err(e) = user.insert_new_user().await{
                    return Ok(Response::new(RegisterStatus {
                        status: e.into()
                    }))
                }
                 Ok(Response::new(RegisterStatus {
                    status: auth::Status::AuthSuccess.into()
                }))
            },
            Err(e) => {
                if e.0.len() > 1 {
                    return Ok(Response::new(RegisterStatus {
                        status: auth::Status::InvalidCredentials.into()
                    }))
                }
                let msg = e.0;
                if msg.contains_key("password") {
                    info!("Validation error password: {}", msg.contains_key("password"));
                    return Ok(Response::new(RegisterStatus {
                        status: auth::Status::WeakPassword.into()
                    }))
                }
                else if msg.contains_key("email") {
                    info!("Validation error email: {}", msg.contains_key("email"));
                    return Ok(Response::new(RegisterStatus {
                        status: auth::Status::InvalidEmail.into()
                    }))
                }

                 Ok(Response::new(RegisterStatus {
                    status: auth::Status::InvalidCredentials.into()
                }))
            }
        }
    }
}

impl AuthServerImpl {
    fn error(status: types::Status, msg: &str) -> Result<Response<Token>, Status> {
        let null = "".to_string();
        Ok(Response::new(Token {
            uid: null.clone(),
            email: null.clone(),
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
    async fn token_credentials(&self, credentials: Credentials) -> Result<Response<Token>, Status> {
        match User::find_by_email(&credentials.email).await {
            Some(user) => {
                if !user.verify_password(&credentials.password).await {
                    return Self::error(types::Status::InvalidCredentials, "InvalidCredentials Username/Password");
                }
                self.token_from(user).await
            }
            _ => {
                Self::error(types::Status::InvalidCredentials, "InvalidCredentials Username/Password")
            }
        }
    }

    async fn token_oauth(&self, oauth: OAuth) -> Result<Response<Token>, Status> {
        debug!("{:#?}" ,oauth);
        if oauth.provider == "google" {
            return match AuthServerImpl::google_provider(&oauth.oauth_token).await {
                Ok(data) => {
                    if let Some(user) = User::find_by_email(&data.email).await {
                        self.token_from(user).await
                    } else {
                        self.new_oath(data).await
                    }
                }
                Err(_e) => AuthServerImpl::error(types::Status::ExpiredToken, "Invalid token")
            } 
        }

        Err(Status::unimplemented("Not yet implemented"))
    }
    async fn google_provider( access_token: &String) -> Result<GoogleUserData, ()> {
        debug!(access_token);
        let url = format!("https://www.googleapis.com/oauth2/v3/userinfo?access_token={}", access_token);
        let client = reqwest::Client::new();
        let res = client.get(url).send().await;
        debug!("Google provider response: {:#?}", res);
        if res.is_ok() {
            let res: Result<GoogleUserData, _> = res.unwrap().json().await;
            if res.is_err() {
                return Err(());
            }
            let data = res.unwrap();
            debug!("Google provider user data: {:#?}", data.clone());
            return Ok(data);
        }
        Err(())
    }
    
    async fn token_from(&self, user: User) -> Result<Response<Token>, Status> {
        let attl = access_token_ttl.parse()
            .expect("Invalid access token ttl");
        let rtll = refresh_token_ttl.parse()
            .expect("Invalid refresh token ttl");
        if let Some((access_token,refresh_token)) = AuthServerImpl::get_cached_tokens(&user.id.to_string()).await
        {
            let access_token_expiration= Some(prost_types::Timestamp::from(SystemTime::now().add(
                std::time::Duration::from_secs(access_token.exp as u64 - access_token.iat as u64)
            )));
            let refresh_token_expiration = Some(prost_types::Timestamp::from(SystemTime::now().add(
                std::time::Duration::from_secs(refresh_token.exp as u64 - refresh_token.iat as u64)
            )));
            Ok(Response::new(Token {
                uid: user.id.to_string(),
                email: user.email,
                access_token: access_token.jwt_token().unwrap(),
                refresh_token: refresh_token.jwt_token().unwrap(),
                status: 0,
                error_message: "".to_string(),
                access_token_expiration, 
                refresh_token_expiration,
                mfa_required: false,
                last_login: None,
            }))
        }else {
            let id = user.id.to_string();
            let access_claim = AccessTokenClaims::new(&id).await;
            let refresh_claim = RefreshTokenClaims::new(&id).await;
            let (access_token, refresh_token) = (access_claim.jwt_token().unwrap(), refresh_claim.jwt_token().unwrap());
            let current_time = SystemTime::now();
            let access_token_expiration = prost_types::Timestamp::from(current_time.add(
                std::time::Duration::from_hours(attl)
            ));
            let refresh_token_expiration = prost_types::Timestamp::from(current_time.add(
                std::time::Duration::from_hours(rtll)));
            Ok(Response::new(Token {
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
    }
    async fn get_cached_tokens(uid: &str) -> Option<(AccessTokenClaims, RefreshTokenClaims)> {
        let instant = Instant::now();
        let access_token = AccessTokenClaims::fetch(uid).await;
        let refresh_token = RefreshTokenClaims::fetch(uid).await;
        info!("Time to fetch {}", instant.elapsed().as_millis());
        if access_token.is_none() ||refresh_token.is_none() { None }
        else {
            let access_token:AccessTokenClaims = serde_json::from_str(&access_token.unwrap()).expect("Failed to parse access token"); 
            let refresh_token: RefreshTokenClaims = serde_json::from_str(&refresh_token.unwrap()).expect("Failed to parse access token");
            Some((access_token, refresh_token))
        }
        
    }
    async fn new_oath(&self, data: GoogleUserData) -> Result<Response<Token>, Status> {
        let user = User::new(
            data.name,
            data.email,
            None,
            "google".to_string(),
            Option::from(data.sub))
            .await;
        if let Ok(user) = user {
            let res = user.clone().insert_new_user().await;
            if res.is_ok() {
                return self.token_from(user).await;
            }
            error!("Cannot insert user in database");
            Err(Status::internal("Internal server error"))
        }else { 
            error!("Cannot create user, validation error");
            Err(Status::internal("Internal server error"))
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
struct GoogleUserData {
    sub: String,
    name: String,
    given_name: String,
    picture: String,
    email: String,
    email_verified: bool
}