pub mod connect;
pub mod message;
pub mod pending_message;
pub mod users;

use std::sync::Arc;
use mongodb::Database;
use mongodb::error::Error;
use scylla::CachingSession;
pub use connect::DatabaseCon;

pub async fn collection_exists(db: &Database, collection_name: &str) -> Result<bool, Error> {
    let collections = db.list_collection_names().await?;
    for collection in collections {
        if collection == collection_name {
            return Ok(true);
        }
    }
   Ok(false) 
}

pub struct Scylla{
    pub(crate) conn: Arc<CachingSession>,
}

impl Clone for Scylla {
    fn clone(&self) -> Self {
        Scylla {
            conn: self.conn.clone()
        }
    }
}

