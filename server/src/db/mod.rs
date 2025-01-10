pub mod message;
pub mod pending_message;
pub mod users;

use std::sync::Arc;
use scylla::CachingSession;


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

