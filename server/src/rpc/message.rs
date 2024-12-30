use tokio::sync::mpsc::Sender;
use tonic::{Code, Status};
use tracing::info;
use crate::db::pending_message::PendingMessage;
use crate::model::events;
use crate::proto::types::events::events::Event;
use crate::proto::types::{Events, MessageCommand, MessageEvent};
use crate::rpc::events::ClientManager;
use crate::rpc::proto;

impl MessageEvent{
    pub async fn on_new_message(&self) -> Result<Event, Status>{ 
        info!("Message {:?}", self); //TODO impl message functions
        if let Ok(cmd) = MessageCommand::try_from(self.command) {
             self.invoke_cmd(cmd).await
        }else { 
            Err(Status::new(Code::InvalidArgument, "Unknown command"))
        }
    }
    pub async fn invoke_cmd(&self, cmd: MessageCommand) -> Result<Event, Status>{
        match cmd {
            MessageCommand::MessageSend => {
                MessageEventService::store(self).await;
                MessageEvent::internal_error("MessageSend not implemented yet") 
            }
            MessageCommand::MessageReceive => {
                MessageEvent::internal_error("MessageReceive not implemented yet")
            }
            MessageCommand::UpdateTimestamp => {
                MessageEvent::internal_error("UpdateTimestamp not implemented yet")
            }
            MessageCommand::EditMessage => {
                MessageEvent::internal_error("EditMessage not implemented yet")
            }
            MessageCommand::DeleteMessage => {
                MessageEvent::internal_error("DeleteMessage not implemented yet")
            }
            MessageCommand::ForwardMessage => {
                MessageEvent::internal_error("ForwardMessage not implemented yet")
            }
            MessageCommand::RetrySend => {
                MessageEvent::internal_error("RetrySend not implemented yet")
            }
            MessageCommand::MarkAsImportant => {
                MessageEvent::internal_error("MarkAsImportant not implemented yet")
            }
            MessageCommand::ArchiveMessage => {
                MessageEvent::internal_error("ArchiveMessage not implemented yet")
            }
            MessageCommand::UnarchiveMessage => {
                MessageEvent::internal_error("UnarchiveMessage not implemented yet")
            }
            MessageCommand::MarkAsSpam => {
                MessageEvent::internal_error("MarkAsSpam not implemented yet")
            }
            MessageCommand::MarkAsRead => {
                MessageEvent::internal_error("MarkAsRead not implemented yet")
            }
            MessageCommand::MarkAsUnread => {
                MessageEvent::internal_error("MarkAsUnread not implemented yet")
            }
            MessageCommand::RevokeMessage => {
                MessageEvent::internal_error("RevokeMessage not implemented yet")
            }
            MessageCommand::PinMessage => {
                MessageEvent::internal_error("PinMessage not implemented yet")
            }
            MessageCommand::UnpinMessage => {
                MessageEvent::internal_error("UnpinMessage not implemented yet")
            }
        }
    }
    
    fn internal_error(msg: &str) -> Result<Event, Status> {
        Err(Status::new(Code::Internal, msg))
    }
}

pub struct MessageEventService;

impl MessageEventService {
    pub async fn store(event: &MessageEvent){
        let mut remaining_dst = event.dst_uids.clone();
        ClientManager::broadcast_message(&mut remaining_dst, event.clone()).await;
        for dst in &remaining_dst {
            info!("Message needs to be sent to {}", dst);
        }
        PendingMessage::send(remaining_dst, &event.clone().into())
            .await.expect("Error: Cannot send event to pending message");
    }
    
    pub async fn send_pending(uid: &str, tx: Sender<Result<Events, Status>>)->Result<(), ()>{
        let msgs = PendingMessage::fetch(String::from(uid)).await.expect("Error: Cannot fetch pending message");
        for msg in msgs {
            let event = Events{
                event: Some(Event::MessageEvent(msg.into())),
            };
            if let Err (e) = tx.send(Ok(event)).await {
                return Err(())
            }
        }
        Ok(())
    }
}
