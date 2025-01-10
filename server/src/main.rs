#![feature(duration_constructors)]

mod db;
mod controllers;
mod middleware;
mod rpc;
pub mod model;
mod types;
mod entity;
use crate::controllers::initialize::{get_jwt_secret_key, initialize_all};
use crate::controllers::login::login_controller;
use crate::rpc::events::metrics_handler;
use crate::rpc::Grpc;
use actix_web::{web, App, HttpServer};
use std::env;
use tracing_actix_web::TracingLogger;

/// Starts the actix-web server and gRPC server.
///
/// This function performs the following steps:
///
/// 1. Calls `initialize_all` to initialize all the services.
/// 2. Calls `get_jwt_secret_key` to get the JWT secret key.
/// 3. Calls `Grpc::build` to build the gRPC server.
/// 4. Starts the actix-web server and binds it to the address specified by the `SERVER_URL` environment variable.
/// 5. Starts the gRPC server.
///
/// # Panics
///
/// If the `SERVER_URL` environment variable is not set, this function will panic.
///
/// # Errors
///
/// If there is an error binding the server to the address, this function will return an error.
#[tokio::main]
async fn main() -> std::io::Result<()> {
    initialize_all().await;
    get_jwt_secret_key().await;
    Grpc::build();
    let server_uri = env::var("SERVER_URL").expect("SERVER_URL environment variable not set"); 
    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .service(web::scope("/api")
                .service(web::scope("/v1")
                    .service(web::scope("/auth")
                        .route("/login", web::get().to(login_controller))
                )
            ))
            .route("/metrics", web::get().to(metrics_handler))
    })
        .bind(server_uri)?
        .run()
        .await

}