#![feature(duration_constructors)]

mod db;
mod controllers;
mod middleware;
mod rpc;
pub mod model;

use crate::controllers::initialize::{get_jwt_secret_key, initialize_all};
use crate::controllers::login::login_controller;
use crate::rpc::Grpc;
use actix_web::{get, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use tracing_actix_web::TracingLogger;
use crate::rpc::events::metrics_handler;

// #[get("/test")]
// async fn test_api(_req: HttpRequest) -> Result<HttpResponse, Error>{
//     Ok(HttpResponse::Ok().json("Hello"))
// }
// 
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    initialize_all().await;
    let key = get_jwt_secret_key().await;
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