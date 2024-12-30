#![feature(duration_constructors)]

mod db;
mod controllers;
mod middleware;
mod rpc;
pub mod model;
pub mod proto;

use crate::controllers::initialize::{get_jwt_secret_key, initialize_all};
use crate::controllers::login::login_controller;
use crate::rpc::events::metrics_handler;
use crate::rpc::Grpc;
use actix_web::{web, App, HttpServer};
use tracing_actix_web::TracingLogger;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    initialize_all().await;
    get_jwt_secret_key().await;
    Grpc::build();

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .route("/login", web::get().to(login_controller))
            .route("/metrics", web::get().to(metrics_handler))
    })
        .bind("0.0.0.0:8080")?
        .run()
        .await

}