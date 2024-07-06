use std::env;

use axum::{http::StatusCode, routing::post, Json, Router};
use lettre::{AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Serialize)]
struct Email {
    to: String,
    subject: String,
    body: String,
}

pub fn email_endpoint() -> String {
    env::var("EMAIL_ENDPOINT").expect("EMAIL_ENDPOINT env var not set")
}

pub fn email_router() -> Router {
    Router::new().route("/api/email", post(email_handler))
}

async fn email_handler(Json(email): Json<Email>) -> StatusCode {
    println!("Sending Email: {:?}", email);

    if env::var("SEND_EMAILS").unwrap_or(String::new()) == "TRUE" {
        send_email(email).await;
    }

    StatusCode::OK
}

async fn send_email(email_contents: Email) {
    let email: Message = Message::builder()
        .from(
            "Martletplace <noreply@martletplace.ca>"
                .parse()
                .expect("Failed to parse sender email"),
        )
        .to(email_contents
            .to
            .parse()
            .expect("Failed to parse recipient email"))
        .subject(email_contents.subject)
        .body(email_contents.body)
        .expect("Failed to create email");

    let mailer: AsyncSmtpTransport<Tokio1Executor> =
        AsyncSmtpTransport::<Tokio1Executor>::from_url(&email_endpoint())
            .expect("Failed to open SMTP connection")
            .build();

    mailer.send(email).await.expect("Failed to send email");
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
