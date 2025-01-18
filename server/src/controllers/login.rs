use actix_web::{HttpResponse, Responder};
use actix_web::http::header::AUTHORIZATION;
use actix_web::web::Json;
use serde::Deserialize;
use serde_json::json;
use tokio::time::Instant;
use tracing::{error, info};
use crate::model::credentials::{AccessTokenClaims, RefreshTokenClaims};
use crate::db::users::User;

#[derive(Deserialize)]
pub struct LoginData {
    email: String,
    password: String,
}


pub async fn login_controller(login_data: Json<LoginData>) -> impl Responder {
    info!("login controller");
    let time = Instant::now();
    match User::find_by_email(&login_data.email).await{ Some(user) => {
        match user.verify_password(&login_data.password).await { 
            true => {
                info!("User with email id {} logged in successfully", &user.email);
                if let Some(res) = AccessTokenClaims::fetch(&user.id.to_string()).await{
                    info!("Time to fetch cached token: {}", time.elapsed().as_millis());
                    return HttpResponse::Ok()
                        .insert_header((AUTHORIZATION, format!("Bearer {}", res.trim())))
                        .json(json!({"Token": res.trim()}))
                }
                let claim = AccessTokenClaims::new(&user.id.to_string()).await;
                
                match claim.jwt_token(){
                    Some(jwt) => {
                        let start = Instant::now();
                        AccessTokenClaims::new(&user.id.to_string()).await.set().await;
                        RefreshTokenClaims::new(&user.id.to_string()).await.set().await;
                        info!("Time taken to generate new token {}", start.elapsed().as_millis());
                        HttpResponse::Ok()
                            .insert_header((AUTHORIZATION, format!("Bearer {}", jwt.trim())))
                            .json(json!({"Token": jwt.trim()}))
                    },
                    None => {
                        info!("Time to err token: {}", time.elapsed().as_millis());
                        error!("Error generating jwt");
                        HttpResponse::InternalServerError().finish()
                    }
                }
            }
            false => {
                info!("Time to err: {}", time.elapsed().as_millis());
                info!("User with email id {} failed logged in successfully", user.email.clone());
                HttpResponse::Unauthorized().finish()
            }
        }
    } _ => {
        info!("Time to err {}", time.elapsed().as_millis());
        info!("User with email id {} not found failed to login", login_data.email.clone());
        HttpResponse::Unauthorized().finish()
    }}
    
}