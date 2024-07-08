use std::future::IntoFuture;

mod email;
mod image;

use email::email_router;
use image::image_router;

#[tokio::main]
async fn main() {
    let email_listener = tokio::net::TcpListener::bind("0.0.0.0:8302").await.unwrap();
    let image_listener = tokio::net::TcpListener::bind("0.0.0.0:8303").await.unwrap();

    let (r1, r2) = tokio::join!(
        axum::serve(email_listener, email_router()).into_future(),
        axum::serve(image_listener, image_router()).into_future()
    );

    r1.unwrap();
    r2.unwrap();
}
