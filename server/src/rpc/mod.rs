use std::{env, thread};
use std::sync::Arc;
use futures::executor::block_on;
use futures::future::BoxFuture;
use futures::FutureExt;
use lazy_static::lazy_static;
use log::info;
use prometheus::{register_counter, register_histogram_vec, Counter, HistogramVec};
use tonic::{Request, Status};
use tonic::transport::Server;
use tonic_reflection::server::Builder;
use tracing::debug;
use crate::model::credentials::Token;
use crate::proto::types::auth_server::AuthServer;
use crate::proto::types::chat_server::ChatServer;
use crate::proto::types::ping_server::PingServer;
use crate::rpc::auth::AuthServerImpl;
use crate::rpc::events::{ChatServerImpl, ClientManager};
use crate::rpc::ping::PingPongImpl;
pub mod ping;
pub mod message;
pub mod events;
pub mod auth;

lazy_static! {
    static ref CLIENT_MANAGER: Arc<ClientManager> = Arc::new(ClientManager::new());
    static ref EVENT_REQUESTS_TOTAL: Counter = register_counter!(
        "grpc_requests_total",
        "Total number of event requests"
    ).unwrap();

    static ref EVENT_REQUEST_DURATION: HistogramVec = register_histogram_vec!(
        "grpc_request_duration_seconds",
        "Histogram of event request duration",
        &["method"]
    ).unwrap();
}
pub mod proto{
    use crate::proto::types::*;
    pub (crate) const FILE_DESCRIPTOR_SET: &[u8] =
        tonic::include_file_descriptor_set!("server_descriptor");
}

fn is_valid_token(token: &str) -> BoxFuture<bool> {
    Box::pin(async move{ 
        let res = Token::get_cached_uid(token).await.is_some() ;
        info!("Token {} is valid: {}", token, res);
        res
    }).boxed()
}
fn check_auth(req: Request<()>) -> Result<Request<()>, Status> {
    match req.metadata().get("authorization") {
        Some(t) =>{
            let auth_str = t.to_str().unwrap_or(""); 
            if auth_str.starts_with("Bearer ") {
                let token = auth_str[7..].to_string();
                
                if block_on(is_valid_token(&token)) {
                    Ok(req)
                } else {
                    info!("Invalid authorization token");
                    Err(Status::unauthenticated("Invalid auth token"))
                }
            }else {
                Err(Status::unauthenticated("No valid auth token")) 
            }
        },
        _ => Err(Status::unauthenticated("No valid auth token")),
    }
}


pub struct Grpc;
impl Grpc {
    pub fn build() {
        thread::spawn(move || {
            debug!("Grpc server starting");
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(4) // Adjust number of threads based on CPU cores
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async { 
                let message_server = ChatServer::with_interceptor(ChatServerImpl, check_auth);
                let ping_server = PingServer::with_interceptor(PingPongImpl, check_auth);
                let auth_server = AuthServer::new(AuthServerImpl);
                let reflection = Builder::configure()
                    .register_encoded_file_descriptor_set(proto::FILE_DESCRIPTOR_SET)
                    .build_v1alpha().unwrap();
        
            Server::builder()
                .max_concurrent_streams(1024)
                .add_service(message_server)
                .add_service(reflection)
                .add_service(ping_server)
                .add_service(auth_server)
                .serve(env::var("GRPC_URL").unwrap().as_str().parse().unwrap())
                .await.expect("Cannot create server");
            });
        });
        
    }
}