pub mod connect;
pub mod message;
pub mod pending_message;

use mongodb::Database;
use mongodb::error::Error;
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