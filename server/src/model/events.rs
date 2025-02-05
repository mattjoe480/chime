use crate::types;
use prost_types::Timestamp as ProtoTimestamp;
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Timestamp {
    pub seconds: i64,
    pub nanos: i32,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Message {
    /// Current status of the message
    pub status: MessageStatus,
    /// Time the message was sent
    pub send_time: Option<Timestamp>,
    /// Time the message was delivered
    pub delivered_time: Option<Timestamp>,
    /// Time the message was read
    pub read_time: Option<Timestamp>,
    /// Unique ID for the message (different from sender_uid)
    pub uid: String,
    pub data: Option<Data>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum Data {
    Text(String),
    Audio(Vec<u8>),
    Video(Vec<u8>),
    Document(Vec<u8>),
    Image(Vec<u8>),
    File(Vec<u8>),
    Url(String),
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[repr(i32)]
pub enum MessageCommand {
    MessageSend,
    /// Receive a message
    MessageReceive,
    /// Update the timestamp (e.g., resend or reattempt)
    UpdateTimestamp,
    /// Edit the content of an existing message
    EditMessage,
    /// Delete the message from the system
    DeleteMessage,
    /// Forward the message to other users
    ForwardMessage,
    /// Retry sending a message (e.g., after failure)
    RetrySend,
    /// Mark the message as important
    MarkAsImportant,
    /// Archive the message (for storage)
    ArchiveMessage,
    /// Unarchive a previously archived message
    UnarchiveMessage,
    /// Mark the message as spam
    MarkAsSpam,
    /// Mark the message as read (may be used explicitly)
    MarkAsRead,
    /// Mark the message as unread
    MarkAsUnread,
    /// Revoke a message (remove it from recipients' devices)
    RevokeMessage,
    /// Pin the message to the top of a chat or thread
    PinMessage,
    /// Unpin a previously pinned message
    UnpinMessage,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum MessageStatus {
    Pending,
    Delivered,
    Read,
    Failed,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct MessageEvent {
    pub command: MessageCommand,
    /// Unique ID for the message (different from sender_uid)
    pub event_uid: String,
    /// Sender's user ID
    pub sender_uid: String,
    /// List of recipient user IDs
    pub dst_uids: Vec<String>,
    /// The message content
    pub message: Option<Message>,
}

impl Into<i32> for MessageStatus {
    fn into(self) -> i32 {
        match self {
            MessageStatus::Pending => 0,   // PENDING = 0
            MessageStatus::Delivered => 1, // DELIVERED = 1
            MessageStatus::Read => 2,      // READ = 2
            MessageStatus::Failed => 3,    // FAILED = 3
        }
    }
}

impl Into<i32> for MessageCommand {
    fn into(self) -> i32 {
        match self {
            MessageCommand::MessageSend => 0,      // MESSAGE_SEND = 0
            MessageCommand::MessageReceive => 1,   // MESSAGE_RECEIVE = 1
            MessageCommand::UpdateTimestamp => 2,  // UPDATE_TIMESTAMP = 2
            MessageCommand::EditMessage => 3,      // EDIT_MESSAGE = 3
            MessageCommand::DeleteMessage => 4,    // DELETE_MESSAGE = 4
            MessageCommand::ForwardMessage => 5,   // FORWARD_MESSAGE = 5
            MessageCommand::RetrySend => 6,        // RETRY_SEND = 6
            MessageCommand::MarkAsImportant => 7,  // MARK_AS_IMPORTANT = 7
            MessageCommand::ArchiveMessage => 8,   // ARCHIVE_MESSAGE = 8
            MessageCommand::UnarchiveMessage => 9, // UNARCHIVE_MESSAGE = 9
            MessageCommand::MarkAsSpam => 10,      // MARK_AS_SPAM = 10
            MessageCommand::MarkAsRead => 11,      // MARK_AS_READ = 11
            MessageCommand::MarkAsUnread => 12,    // MARK_AS_UNREAD = 12
            MessageCommand::RevokeMessage => 13,   // REVOKE_MESSAGE = 13
            MessageCommand::PinMessage => 14,      // PIN_MESSAGE = 14
            MessageCommand::UnpinMessage => 15,    // UNPIN_MESSAGE = 15
        }
    }
}

impl Into<ProtoTimestamp> for Timestamp {
    fn into(self) -> ProtoTimestamp {
        ProtoTimestamp {
            seconds: self.seconds,
            nanos: self.nanos,
        }
    }
}

impl Into<types::Message> for Message {
    fn into(self) -> types::Message {
        types::Message {
            status: self.status.into(),
            send_time: self.send_time.map(|t| t.into()),
            delivered_time: self.delivered_time.map(|t| t.into()),
            read_time: self.read_time.map(|t| t.into()),
            uid: self.uid,
            data: self.data.map(|d| d.into()),
        }
    }
}

impl Into<types::message::Data> for Data {
    fn into(self) -> types::message::Data {
        match self {
            Data::Text(text) => types::message::Data::Text(text),
            Data::Audio(audio) => types::message::Data::Audio(audio),
            Data::Video(video) => types::message::Data::Video(video),
            Data::Document(document) => types::message::Data::Document(document),
            Data::Image(image) => types::message::Data::Image(image),
            Data::File(file) => types::message::Data::File(file),
            Data::Url(url) => types::message::Data::Url(url),
        }
    }
}

impl Into<types::MessageEvent> for MessageEvent {
    fn into(self) -> types::MessageEvent {
        types::MessageEvent {
            command: self.command.into(),
            event_uid: self.event_uid,
            sender_uid: self.sender_uid,
            dst_uids: self.dst_uids,
            message: self.message.map(|msg| msg.into()),
        }
    }
}

impl Into<MessageStatus> for i32 {
    fn into(self) -> MessageStatus {
        match self {
            0 => MessageStatus::Pending,   // PENDING = 0
            1 => MessageStatus::Delivered, // DELIVERED = 1
            2 => MessageStatus::Read,      // READ = 2
            3 => MessageStatus::Failed,    // FAILED = 3
            _ => panic!("Unknown MessageStatus value: {}", self),
        }
    }
}

impl Into<MessageCommand> for i32 {
    fn into(self) -> MessageCommand {
        match self {
            0 => MessageCommand::MessageSend,      // MESSAGE_SEND = 0
            1 => MessageCommand::MessageReceive,   // MESSAGE_RECEIVE = 1
            2 => MessageCommand::UpdateTimestamp,  // UPDATE_TIMESTAMP = 2
            3 => MessageCommand::EditMessage,      // EDIT_MESSAGE = 3
            4 => MessageCommand::DeleteMessage,    // DELETE_MESSAGE = 4
            5 => MessageCommand::ForwardMessage,   // FORWARD_MESSAGE = 5
            6 => MessageCommand::RetrySend,        // RETRY_SEND = 6
            7 => MessageCommand::MarkAsImportant,  // MARK_AS_IMPORTANT = 7
            8 => MessageCommand::ArchiveMessage,   // ARCHIVE_MESSAGE = 8
            9 => MessageCommand::UnarchiveMessage, // UNARCHIVE_MESSAGE = 9
            10 => MessageCommand::MarkAsSpam,      // MARK_AS_SPAM = 10
            11 => MessageCommand::MarkAsRead,      // MARK_AS_READ = 11
            12 => MessageCommand::MarkAsUnread,    // MARK_AS_UNREAD = 12
            13 => MessageCommand::RevokeMessage,   // REVOKE_MESSAGE = 13
            14 => MessageCommand::PinMessage,      // PIN_MESSAGE = 14
            15 => MessageCommand::UnpinMessage,    // UNPIN_MESSAGE = 15
            _ => panic!("Unknown MessageCommand value: {}", self),
        }
    }
}

impl Into<Message> for types::Message {
    fn into(self) -> Message {
        Message {
            status: self.status.into(),
            send_time: self.send_time.map(|t| t.into()),
            delivered_time: self.delivered_time.map(|t| t.into()),
            read_time: self.read_time.map(|t| t.into()),
            uid: self.uid,
            data: self.data.map(|d| d.into()),
        }
    }
}

impl Into<Timestamp> for ProtoTimestamp {
    fn into(self) -> Timestamp {
        Timestamp {
            seconds: self.seconds,
            nanos: self.nanos,
        }
    }
}

impl Into<Data> for types::message::Data {
    fn into(self) -> Data {
        match self {
            types::message::Data::Text(text) => Data::Text(text),
            types::message::Data::Audio(audio) => Data::Audio(audio),
            types::message::Data::Video(video) => Data::Video(video),
            types::message::Data::Document(document) => Data::Document(document),
            types::message::Data::Image(image) => Data::Image(image),
            types::message::Data::File(file) => Data::File(file),
            types::message::Data::Url(url) => Data::Url(url),
        }
    }
}

impl Into<MessageEvent> for types::MessageEvent {
    fn into(self) -> MessageEvent {
        MessageEvent {
            command: self.command.into(),
            event_uid: self.event_uid,
            sender_uid: self.sender_uid,
            dst_uids: self.dst_uids,
            message: self.message.map(|msg| msg.into()),
        }
    }
}
impl fmt::Display for MessageStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // Match on the enum variant and format the string accordingly
        match self {
            MessageStatus::Pending => write!(f, "Pending"),
            MessageStatus::Delivered => write!(f, "Delivered"),
            MessageStatus::Read => write!(f, "Read"),
            MessageStatus::Failed => write!(f, "Failed"),
        }
    }
}
