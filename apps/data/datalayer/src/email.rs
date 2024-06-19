use axum::{http::StatusCode, routing::post, Json, Router};
use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Deserialize, Debug, Serialize)]
struct Email {
    to: String,
    subject: String,
    body: String,
}

pub fn email_router() -> Router {
    Router::new().route("/api/email", post(email_handler))
}

async fn email_handler(Json(email): Json<Email>) -> StatusCode {
    println!("Sending Email: {:?}", email);
    StatusCode::OK
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        extract::Request,
        http::{self, StatusCode},
    };
    use rstest::*;
    use tower::ServiceExt;

    #[rstest]
    #[tokio::test]
    async fn send_email() {
        let email = Email {
            to: String::from("me@mail.com"),
            subject: String::from("Test email"),
            body: String::from("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
        };
        let app = email_router();

        let response = app
            .oneshot(
                Request::post("/api/email")
                    .header(http::header::CONTENT_TYPE, mime::APPLICATION_JSON.as_ref())
                    .body(Body::from(serde_json::to_vec(&email).unwrap()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }
}
