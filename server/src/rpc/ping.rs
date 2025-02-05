use crate::types::ping_server::Ping;
use crate::types::{PingMsg, Pong};
use std::pin::Pin;
use tokio::sync::mpsc;
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::tokio_stream::{Stream, StreamExt};
use tonic::{async_trait, Request, Response, Status, Streaming};

#[derive(Default)]
pub struct PingPongImpl;

#[async_trait]
impl Ping for PingPongImpl {
    async fn ping(&self, request: Request<PingMsg>) -> Result<Response<Pong>, Status> {
        println!("Received a ping: {:?}", request);
        let pong = Pong {
            message: "Pong".to_string(),
        };
        Ok(Response::new(pong))
    }

    type PingStreamStream = Pin<Box<dyn Stream<Item = Result<Pong, Status>> + Send>>;

    async fn ping_stream(
        &self,
        request: Request<Streaming<PingMsg>>,
    ) -> Result<Response<Self::PingStreamStream>, Status> {
        let mut in_stream = request.into_inner();
        let (tx, rx) = mpsc::channel(128);
        tokio::spawn(async move {
            while let Some(result) = in_stream.next().await {
                match result {
                    Ok(v) => tx.send(Ok(Pong { message: v.message })).await.unwrap(),
                    Err(err) => {
                        match tx.send(Err(err)).await {
                            Ok(_) => (),
                            Err(_err) => break, // response was dropped
                        }
                    }
                }
            }
        });
        let out_stream = ReceiverStream::new(rx);
        Ok(Response::new(Box::pin(out_stream) as Self::PingStreamStream))
    }
}
