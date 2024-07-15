use std::env;

use axum::{body::Body, extract, Router};
use reqwest::{Client, RequestBuilder, Url};
use tower_http::catch_panic::CatchPanicLayer;

pub fn elastic_endpoint() -> String {
    env::var("ELASTIC_ENDPOINT").expect("ELASTIC_ENDPOINT env var not set")
}

pub fn elastic_router() -> Router {
    Router::new()
        .fallback(elastic_proxy)
        .layer(CatchPanicLayer::new())
}

pub async fn elastic_proxy(server_request: extract::Request) -> axum::response::Response {
    proxy_request(server_request, elastic_endpoint()).await
}

async fn proxy_request(
    server_request: extract::Request,
    proxy_host: String,
) -> axum::response::Response {
    let (parts, server_body) = server_request.into_parts();

    let mut proxy_url = Url::parse(&proxy_host).expect("Couldn't parse request URL");
    proxy_url = proxy_url
        .join(&parts.uri.to_string())
        .expect("Couldn't join request path");

    let proxied_request = reqwest::Request::new(parts.method, proxy_url);
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .expect("Couldn't build client");

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

    let mut response = axum::response::Response::builder()
        .status(proxied_response.status())
        .version(proxied_response.version());

    for (key, value) in proxied_response.headers().into_iter() {
        response = response.header(key, value);
    }

    response
        .body(Body::from_stream(proxied_response.bytes_stream()))
        .expect("Couldn't create server response")
}
