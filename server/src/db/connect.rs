use mongodb::Client;
use mongodb::options::{ClientOptions, ServerApi, ServerApiVersion};
use tracing::{error, info};
use crate::controllers::initialize::get_mongodb_uri;

#[derive(Clone)]
pub struct DatabaseCon{
    pub client: Client,
}
impl DatabaseCon{

    async fn connect_to_db() -> mongodb::error::Result<Client> { 
        let mut client_options = ClientOptions::parse(get_mongodb_uri().await).await?;
        let server_api = ServerApi::builder().version(ServerApiVersion::V1).build();
        client_options.server_api = Some(server_api);
        Client::with_options(client_options)
    }
    pub async fn new() -> DatabaseCon {
        info!("Connecting to MongoDB...");
        match DatabaseCon::connect_to_db().await {
            Ok(db) => DatabaseCon{client: db},
            Err(e) => {
                error!("Failed to connect to MongoDB: {}", e);
                DatabaseCon{client: Client::with_options(ClientOptions::default()).unwrap()}
            }

        }
    }
}