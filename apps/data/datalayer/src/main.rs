use std::future::IntoFuture;

use elastic::elastic_router;
use email::{email_endpoint, email_router};
use image::image_router;

mod elastic;
mod email;
mod image;

#[tokio::main]
async fn main() {
    // Check that the env var is set
    email_endpoint();

    let elastic_listener = tokio::net::TcpListener::bind("0.0.0.0:8301").await.unwrap();
    let email_listener = tokio::net::TcpListener::bind("0.0.0.0:8302").await.unwrap();
    let image_listener = tokio::net::TcpListener::bind("0.0.0.0:8303").await.unwrap();

    let (r1, r2, r3) = tokio::join!(
        axum::serve(elastic_listener, elastic_router()).into_future(),
        axum::serve(email_listener, email_router()).into_future(),
        axum::serve(image_listener, image_router()).into_future()
    );

    r1.unwrap();
    r2.unwrap();
    r3.unwrap();
}
