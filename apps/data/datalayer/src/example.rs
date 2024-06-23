use axum::{routing::get, Router};

pub fn example_router() -> Router {
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
        let app = example_router();

        let response = app
            .oneshot(Request::get("/").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        assert_eq!(&body[..], b"Hello, World!");
    }
}
