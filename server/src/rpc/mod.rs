pub mod auth;
pub mod events;
pub mod message;
pub mod onboarding;
pub mod ping;
pub mod admin;

use crate::model::credentials::AccessTokenClaims;
use crate::rpc::auth::AuthServerImpl;
use crate::rpc::events::{ChatServerImpl, ClientManager};
use crate::rpc::onboarding::OnboardingServerImpl;
use crate::rpc::ping::PingPongImpl;
use crate::rpc::admin::AdminServiceImpl;
use crate::types::auth_server::AuthServer;
use crate::types::chat_server::ChatServer;
use crate::types::onboarding::onboarding_server::OnboardingServer;
use crate::types::ping_server::PingServer;
use crate::types::admin::admin_service_server::AdminServiceServer;
use lazy_static::lazy_static;
use prometheus::{register_counter, register_histogram_vec, Counter, HistogramVec};
use std::sync::Arc;
use std::{env, thread};
use tonic::transport::Server;
use tonic::{Request, Status};
use tonic_reflection::server::Builder;
use tracing::{debug, info};

lazy_static! {
    static ref CLIENT_MANAGER: Arc<ClientManager> = Arc::new(ClientManager::new());
    static ref EVENT_REQUESTS_TOTAL: Counter =
        register_counter!("grpc_requests_total", "Total number of event requests").unwrap();
    static ref EVENT_REQUEST_DURATION: HistogramVec = register_histogram_vec!(
        "grpc_request_duration_seconds",
        "Histogram of event request duration",
        &["method"]
    )
    .unwrap();
}
pub mod proto {
    pub(crate) const FILE_DESCRIPTOR_SET: &[u8] =
        include_bytes!("../../proto/reflection/server_descriptor.bin");
}

fn is_valid_token(token: &str) -> bool {
    if let Ok(token) = AccessTokenClaims::from_jwt(token.to_string()) {
        info!("Token {:#?} is valid", token);
        true
    } else {
        false
    }
}

fn check_auth(req: Request<()>) -> Result<Request<()>, Status> {
    match req.metadata().get("authorization") {
        Some(t) => {
            let auth_str = t.to_str().unwrap_or("");
            if auth_str.starts_with("Bearer ") {
                let token = auth_str[7..].to_string();
                if is_valid_token(&token) {
                    Ok(req)
                } else {
                    info!("Invalid authorization token");
                    Err(Status::unauthenticated("Invalid auth token"))
                }
            } else {
                Err(Status::unauthenticated("No valid auth token"))
            }
        }
        _ => Err(Status::unauthenticated("No valid auth token")),
    }
}

fn check_auth_admin(req: Request<()>) -> Result<Request<()>, Status> {
    match req.metadata().get("authorization") {
        Some(t) => {
            let auth_str = t.to_str().unwrap_or("");
            if auth_str.starts_with("Bearer ") {
                let token = auth_str[7..].to_string();
                if let Ok(claims) = AccessTokenClaims::from_jwt(token) {
                    // Check if user has admin role
                    if claims.role == "ADMIN" {
                        Ok(req)
                    } else {
                        info!("User does not have admin privileges");
                        Err(Status::permission_denied("Insufficient privileges"))
                    }
                } else {
                    info!("Invalid authorization token");
                    Err(Status::unauthenticated("Invalid auth token"))
                }
            } else {
                Err(Status::unauthenticated("No valid auth token"))
            }
        }
        _ => Err(Status::unauthenticated("No valid auth token")),
    }
}

pub struct Grpc;
impl Grpc {
    pub fn build() {
        thread::spawn(move || {
            debug!("Grpc server starting");
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .worker_threads(4)
                .enable_all()
                .build()
                .unwrap();
            runtime.block_on(async {
                let message_server = ChatServer::with_interceptor(ChatServerImpl, check_auth);
                let ping_server = PingServer::with_interceptor(PingPongImpl, check_auth);
                let auth_server = AuthServer::new(AuthServerImpl);
                let onboarding_server =
                    OnboardingServer::with_interceptor(OnboardingServerImpl, check_auth);
                
                // Initialize admin service with database connection
                let admin_service = AdminServiceImpl::new(DB.get().unwrap().clone());
                let admin_server = AdminServiceServer::with_interceptor(admin_service, check_auth_admin);
                
                let reflection = Builder::configure()
                    .register_encoded_file_descriptor_set(proto::FILE_DESCRIPTOR_SET)
                    .build_v1alpha()
                    .unwrap();
                
                let grpc_url = env::var("GRPC_URL").expect("GRPC_URL env var not set");
                debug!("Starting Grpc server at {}", grpc_url);
                Server::builder()
                    .max_concurrent_streams(1024)
                    .add_service(message_server)
                    .add_service(reflection)
                    .add_service(ping_server)
                    .add_service(auth_server)
                    .add_service(onboarding_server)
                    .add_service(admin_server)
                    .serve(grpc_url.parse().unwrap())
                    .await
                    .expect("Cannot create server");
            });
        });
    }
}
