use actix_web::{HttpResponse, Responder};
use actix_web::http::header::AUTHORIZATION;
use actix_web::web::Json;
use serde::Deserialize;
use serde_json::json;
use tokio::time::Instant;
use tracing::{error, info};
use crate::model::credentials::{Claims, Token};
use crate::model::user::User;

#[derive(Deserialize)]
pub struct LoginData {
    email: String,
    password: String,
}


pub async fn login_controller(login_data: Json<LoginData>) -> impl Responder {
    info!("login controller");
    let time = Instant::now();
    if let Ok(user) = User::find_by_email(&login_data.email).await{
        match user.verify_password(&login_data.password).await { 
            true => {
                info!("User with email id {} logged in successfully", &user.email);
                if let Some(res) = Token::get_access_token(&user.uid).await{
                    info!("Time to fetch cached token: {}", time.elapsed().as_millis());
                    return HttpResponse::Ok()
                        .insert_header((AUTHORIZATION, format!("Bearer {}", res.trim())))
                        .json(json!({"Token": res.trim()}))
                }
                let claim = Claims::new(&user.uid).await;
                
                match claim.generate_jwt().await{
                    Ok(jwt) => {
                        let start = Instant::now();
                        Token::new(user.uid.clone(), jwt.clone()).await;
                        info!("Time taken to generate new token {}", start.elapsed().as_millis());
                        HttpResponse::Ok()
                            .insert_header((AUTHORIZATION, format!("Bearer {}", jwt.trim())))
                            .json(json!({"Token": jwt.trim()}))
                    },
                    Err(e) => {
                        error!("Error generating jwt: {}", e);
                        HttpResponse::InternalServerError().finish()
                    }
                }
            }
            false => {
                info!("User with email id {} failed logged in successfully", user.email.clone());
                HttpResponse::Unauthorized().finish()
            }
        }
    }else { 
        info!("User with email id {} not found failed to login", login_data.email.clone());
        HttpResponse::Unauthorized().finish()
    }
    
}