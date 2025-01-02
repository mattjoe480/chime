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
use crate::db::users;
use crate::rpc::events::metrics_handler;
use crate::rpc::Grpc;
use actix_web::{web, App, HttpServer};
use std::env;
use tracing_actix_web::TracingLogger;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    initialize_all().await;
    get_jwt_secret_key().await;
    Grpc::build();
    let server_uri = env::var("SERVER_URL").expect("SERVER_URL environment variable not set"); 
    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .route("/login", web::get().to(login_controller))
            .route("/metrics", web::get().to(metrics_handler))
    })
        .bind(server_uri)?
        .run()
        .await

}