use crate::model::credentials::AccessTokenClaims;
use crate::rpc::message::MessageEventService;
use crate::rpc::{CLIENT_MANAGER, EVENT_REQUESTS_TOTAL, EVENT_REQUEST_DURATION};
use crate::types::chat_server::Chat;
use crate::types::events::events::Event;
use crate::types::{Events, MessageCommand, MessageEvent, SuccessCode, SuccessEvent};
use actix_web::Responder;
use prometheus::core::Collector;
use prometheus::proto::MetricFamily;
use prometheus::{Encoder, TextEncoder};
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::{Stream, StreamExt};
use tonic::{Request, Response, Status, Streaming};
use tracing::info;

pub struct ChatServerImpl;

#[tonic::async_trait]
impl Chat for ChatServerImpl {
    type MessageServiceStream = Pin<Box<dyn Stream<Item = Result<Events, Status>> + Send>>;

    async fn message_service(
        &self,
        request: Request<Streaming<Events>>,
    ) -> Result<Response<Self::MessageServiceStream>, Status> {
        let bearer = request
            .metadata()
            .get("authorization")
            .unwrap()
            .to_str()
            .unwrap();
        let token = bearer.replace("Bearer ", "");
        let uid = AccessTokenClaims::from_jwt(token).unwrap().sub;
        let mut in_stream = request.into_inner();
        let (tx, rx) = mpsc::channel(128);
        CLIENT_MANAGER.insert_client(uid.clone(), tx.clone()).await;
        tokio::spawn(async move {
            MessageEventService::send_pending(&uid, tx.clone())
                .await
                .expect("Cannot send pending message");
            EVENT_REQUESTS_TOTAL.inc();
            let timer = EVENT_REQUEST_DURATION
                .with_label_values(&["stream_data"])
                .start_timer();
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(events) => {
                        if let Event::MessageEvent(msg) = events.clone().event.unwrap() {
                            ClientManager::broadcast_message(&mut msg.dst_uids.clone(), msg).await;
                        }
                        if let Ok(event) = ChatServerImpl::handle(&events).await {
                            tx.send(Ok(Events { event: Some(event) })).await.unwrap();
                        }
                    }
                    Err(_) => {
                        break;
                    }
                }
            }
            CLIENT_MANAGER.remove_client(uid.parse().unwrap());
            timer.observe_duration();
        });
        let out_stream = ReceiverStream::new(rx);
        Ok(Response::new(
            Box::pin(out_stream) as Self::MessageServiceStream
        ))
    }
}

impl ChatServerImpl {
    async fn handle(events: &Events) -> Result<Event, Status> {
        if let Some(events) = &events.event {
            match events {
                Event::MessageEvent(message) => {
                    return message.on_new_message().await;
                }
                Event::TypingEvent(_) => {}
                Event::UserStatusEvent(_) => {}
                Event::StatusUpdate(_) => {}
                Event::KeyExchangeEvent(_) => {}
                Event::SuccessEvent(_) => {}
            }
        };
        todo!()
    }
}

pub struct ClientManager {
    clients: Mutex<HashMap<String, mpsc::Sender<Result<Events, Status>>>>,
}

impl ClientManager {
    async fn insert_client(&self, client_id: String, sender: mpsc::Sender<Result<Events, Status>>) {
        info!("Registering user {}", client_id);
        sender
            .send(Ok(Events {
                event: Some(Event::SuccessEvent(SuccessEvent {
                    event_uid: "1".to_string(),
                    success_code: SuccessCode::SessionEstablished.into(),
                    description: "Connection established successfully".to_string(),
                })),
            }))
            .await
            .unwrap();
        let mut clients = self.clients.lock().unwrap();
        clients.insert(client_id, sender);
    }
    fn get_clients(&self) -> HashMap<String, mpsc::Sender<Result<Events, Status>>> {
        let clients = self.clients.lock().unwrap();
        clients.clone()
    }
    pub fn remove_client(&self, client_id: String) {
        info!("Removing user {}", client_id);
        let mut clients = self.clients.lock().unwrap();
        clients.remove(&client_id);
    }
    pub fn new() -> Self {
        ClientManager {
            clients: Mutex::new(HashMap::new()),
        }
    }
    pub async fn broadcast_message(dst: &mut Vec<String>, msg: MessageEvent) {
        let clients = CLIENT_MANAGER.get_clients();
        let loop_counter = dst.clone().into_iter().enumerate();
        for (index, client) in loop_counter {
            if let Some(sender) = clients.get(&client) {
                let mut msg = msg.clone();
                msg.command = MessageCommand::MessageReceive.into();
                let res = sender
                    .send(Ok(Events {
                        event: Some(Event::MessageEvent(msg)),
                    }))
                    .await;
                if res.is_ok() {
                    dst.remove(index);
                }
            }
        }
    }
}
pub async fn metrics_handler() -> impl Responder {
    // Create an encoder for Prometheus text format
    let encoder = TextEncoder::new();
    let mut metric_families: Vec<MetricFamily> = Vec::new(); // Collect all registered metrics
    for i in EVENT_REQUESTS_TOTAL.collect() {
        metric_families.push(i);
    }
    for i in EVENT_REQUEST_DURATION.collect() {
        metric_families.push(i);
    }

    let mut buffer = Vec::new();
    if encoder.encode(&metric_families, &mut buffer).is_err() {
        return actix_web::HttpResponse::NoContent().finish();
    }
    actix_web::HttpResponse::Ok()
        .content_type(encoder.format_type())
        .body(buffer)
}
