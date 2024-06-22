use std::future::IntoFuture;

use email::email_router;
use example::example_router;

mod email;
mod example;

#[tokio::main]
async fn main() {
    let example_listener = tokio::net::TcpListener::bind("0.0.0.0:8301").await.unwrap();
    let email_listener = tokio::net::TcpListener::bind("0.0.0.0:8302").await.unwrap();

    let (r1, r2) = tokio::join!(
        axum::serve(example_listener, example_router()).into_future(),
        axum::serve(email_listener, email_router()).into_future()
    );

    r1.unwrap();
    r2.unwrap();
}
