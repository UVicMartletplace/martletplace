use axum::{
    body::to_bytes,
    extract,
    http::{self, request, Request},
    routing::post,
    Router,
};
use reqwest::Client;
use tower_http::catch_panic::CatchPanicLayer;

pub fn elastic_router() -> Router {
    Router::new()
        .route("/", post(elastic_proxy))
        .layer(CatchPanicLayer::new())
}

async fn elastic_proxy(server_request: extract::Request) -> axum::response::Response {
    let (parts, original_body) = server_request.into_parts();
    let intermediate_request: request::Request<axum::body::Bytes> = Request::from_parts(
        parts,
        to_bytes(original_body, usize::MAX)
            .await
            .expect("Failed to get request parts"),
    );
    let proxy_request: reqwest::Request = intermediate_request
        .try_into()
        .expect("Failed to create reqwest object");

    let client = Client::new();
    let proxy_response: http::Response<reqwest::Body> = client
        .execute(proxy_request)
        .await
        .expect("Failed to execute proxied request")
        .into();
    let server_response: axum::response::Response = proxy_response
        .map(|body: reqwest::Body| Vec::from(body.as_bytes().expect("Failed to get body bytes")))
        .map(|body: Vec<u8>| body.into());

    return server_response;
}
