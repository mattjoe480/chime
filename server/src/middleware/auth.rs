use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    error::ErrorUnauthorized,
    Error,
};
use futures::future::{ready, Ready};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use futures::future::LocalBoxFuture;
use tokio::time::Instant;
use tracing::log::info;
use crate::model::credentials::{AccessTokenClaims, RefreshTokenClaims};

#[derive(Clone)]
pub struct JwtMiddleware {
    secret_key: String,
}

impl JwtMiddleware {
    pub fn new(secret_key: String) -> Self {
        Self { secret_key }
    }
}

impl<S, B> Transform<S, ServiceRequest> for JwtMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = JwtMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(JwtMiddlewareService {
            service,
            secret_key: self.secret_key.clone(),
        }))
    }
}

pub struct JwtMiddlewareService<S> {
    service: S,
    secret_key: String,
}

impl<S, B> Service<ServiceRequest> for JwtMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let token = match req.headers().get("Authorization") {
            Some(auth_header) => {
                let auth_str = auth_header.to_str().unwrap_or("");
                if auth_str.starts_with("Bearer ") {
                    let token = auth_str[7..].to_string();
                    token
                } else {
                    return Box::pin(async move {
                        Err(ErrorUnauthorized("Invalid authorization header format"))
                    });
                }
            }
            None => {
                return Box::pin(async move {
                    Err(ErrorUnauthorized("Missing authorization header"))
                });
            }
        };

        let secret_key = self.secret_key.clone();
        let fut = self.service.call(req);

        info!("Secret key: {}", secret_key);
        Box::pin(async move {
            match decode::<AccessTokenClaims>(
                &token,
                &DecodingKey::from_secret(secret_key.as_bytes()),
                &Validation::new(Algorithm::HS256),
            ) {
                Ok(_token_data) => {
                    let start = Instant::now();
                    info!("Middleware took {:?}", start.elapsed());
                    fut.await
                }
                Err(_) => Err(ErrorUnauthorized("Invalid token")),
            }
        })
    }
}