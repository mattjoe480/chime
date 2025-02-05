use crate::controllers::initialize::get_redis_conn;
use crate::model::events::MessageEvent;
use futures::executor::block_on;
use redis::{Commands, ErrorKind, RedisError, RedisResult};
use std::thread;

pub struct PendingMessage;

impl PendingMessage {
    pub async fn send(dst_uids: Vec<String>, message: &MessageEvent) -> RedisResult<()> {
        let str_message = serde_json::to_string(&message).unwrap();
        if message.dst_uids.is_empty() {
            return Err(RedisError::from((
                ErrorKind::ParseError,
                "Message destination is null",
            )));
        }
        for dst in dst_uids {
            get_redis_conn()
                .await
                .as_mut()
                .unwrap()
                .lpush::<String, String, String>(
                    format!("pending_messages:{}", dst),
                    str_message.clone(),
                )?;
        }
        Ok(())
    }
    pub async fn fetch(uid: String) -> RedisResult<Vec<MessageEvent>> {
        let serialized_messages: Vec<String> = get_redis_conn().await.as_mut().unwrap().lrange(
            format!("pending_messages:{}", uid),
            0,
            -1,
        )?;
        let msgs = serialized_messages.clone();
        let id = uid.clone();
        let message = serialized_messages
            .into_iter()
            .filter_map(|m| serde_json::from_str(&m).ok())
            .collect();
        thread::spawn(move || Self::remove_all(uid));
        Ok(message)
    }
    pub fn remove_all(uid: String) -> RedisResult<()> {
        block_on(async {
            let serialized_messages: Vec<String> = get_redis_conn()
                .await
                .as_mut()
                .unwrap()
                .lrange(format!("pending_messages:{}", uid), 0, -1)
                .expect("Failed to get pending messages");
            for message in serialized_messages {
                get_redis_conn()
                    .await
                    .as_mut()
                    .unwrap()
                    .lrem::<String, String, String>(format!("pending_messages:{}", uid), 0, message)
                    .expect("Failed to remove pending messages");
            }
        });
        Ok(())
    }
}
