use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8301").await.unwrap();
    axum::serve(listener, app()).await.unwrap();
}

fn app() -> Router {
    Router::new().route("/", get(|| async { "Hello, World!" }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        extract::Request,
        http::StatusCode,
    };
    use rstest::*;
    use tower::ServiceExt;

    #[rstest]
    #[tokio::test]
    async fn hello_world() {
        let app = app();

        let response = app
            .oneshot(Request::get("/").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        assert_eq!(&body[..], b"Hello, World!");
    }
}
