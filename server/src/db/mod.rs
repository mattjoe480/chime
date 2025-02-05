pub mod message;
pub mod pending_message;
pub mod role;
pub mod users;

use scylla::CachingSession;
use std::sync::Arc;

pub struct Scylla {
    pub(crate) conn: Arc<CachingSession>,
}

impl Clone for Scylla {
    fn clone(&self) -> Self {
        Scylla {
            conn: self.conn.clone(),
        }
    }
}
