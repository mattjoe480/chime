use std::sync::Arc;

use mongodb::{bson::doc, Collection};
use tokio::sync::Mutex;
use tracing::info;

use crate::controllers::initialize::get_mongodb_conn;
use lazy_static::lazy_static;
use tracing::log::warn;
use crate::model::events::{MessageEvent, MessageStatus};
use crate::model::user::User;

lazy_static!{
    static ref db_conn: Arc<Mutex<Option<Collection<MessageEvent>>>> = Arc::new(Mutex::new(None));
}

async fn get_db_conn() -> Collection<MessageEvent>{
    get_mongodb_conn().await.client.database("chat").collection("message")
}

pub async fn get_cached_db_conn() -> Collection<MessageEvent> {
    let mut lock = db_conn.lock().await;
    match lock.take() {
        Some(db) => db,
        None => {
            *lock = Some(get_db_conn().await);
            lock.take().unwrap()
        }
    }
}

pub async fn fetch_msg(uid: &str) -> Result<MessageEvent, String>{
    let db = get_cached_db_conn().await;
    match db.find_one(doc! {"uid": uid}).await {
        Ok(data) => {
            if data.is_some() {
                return Ok(data.unwrap());
            }
            Err("Message not found".into())
        },
        Err(_) => Err("Message not found".into()),
    }
}

pub async fn write_msg(msg: &MessageEvent) -> Result<String, String>{
    let collection = get_cached_db_conn();
    let data = &mut msg.clone();
    if msg.message.is_none() || msg.dst_uids.is_empty(){
        return  Err("Message is null".into());
    }
    let mut uids = msg.dst_uids.clone();
    uids.push(msg.sender_uid.clone());
    if is_valid_uids(uids).await{ 
        // data.status = MessageStatus::Received; 
        let res = collection.await.insert_one(data).await;
        match res {
            Ok(_) => {
                info!("Message inserted successfully");
                Ok("Success".to_string())
            }
            Err(e) =>
                {
                    warn!("Error: {}", e);
                    Err("Internal Server Error".to_string())
                } 
        }
    }else { 
        Err("Internal Server Error".into())
    } 
}

pub async fn update_status(uid: String, status: MessageStatus) -> String{
    let collection = get_cached_db_conn();
    let filter = doc! {"uid": uid};
    let update = doc! { "$set": doc! {"status": status.to_string() }};
    match collection.await.update_one(filter, update).await{
        Ok(_) => "Success".to_string(),
        Err(_) => "Internal server error!".to_string(),
    }
}

pub async fn is_valid_uids(uids: Vec<String>) -> bool {
    for uid in uids {
        if User::find_by_uid(&uid).await.is_err() { // TODO Optimze this call
            return false;
        }
    }
    true
}