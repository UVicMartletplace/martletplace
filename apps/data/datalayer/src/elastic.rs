use std::env;

use axum::{body::Body, extract, routing::post, Router};
use reqwest::{Client, RequestBuilder, Url};
use tower_http::catch_panic::CatchPanicLayer;

pub fn elastic_endpoint() -> String {
    env::var("ELASTIC_ENDPOINT").expect("ELASTIC_ENDPOINT env var not set")
}

pub fn elastic_router() -> Router {
    Router::new()
        .route("/", post(elastic_proxy))
        .layer(CatchPanicLayer::new())
}

async fn elastic_proxy(server_request: extract::Request) -> axum::response::Response {
    let (parts, server_body) = server_request.into_parts();

    let mut proxy_url = Url::parse(&parts.uri.to_string()).expect("Couldn't parse request URL");
    proxy_url
        .set_host(Some(&elastic_endpoint()))
        .expect("Couldn't set the request host");

    let proxied_request = reqwest::Request::new(parts.method, proxy_url);
    let client = Client::new();

    let request_builder = RequestBuilder::from_parts(client, proxied_request)
        .headers(parts.headers)
        .body(
            axum::body::to_bytes(server_body, usize::MAX)
                .await
                .expect("Failed to get request body"),
        );

    let proxied_response = request_builder
        .send()
        .await
        .expect("Failed to send proxied request");

    let server_response = axum::response::Response::builder()
        .status(proxied_response.status())
        .version(proxied_response.version())
        .body(Body::from_stream(proxied_response.bytes_stream()))
        .expect("Couldn't create server response");

    return server_response;
}
