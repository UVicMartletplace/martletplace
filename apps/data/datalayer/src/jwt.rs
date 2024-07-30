use std::env;

use axum::{body::Body, extract::Request, middleware::Next, response::Response};
use axum_extra::extract::CookieJar;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Claims {
    user_id: u32,
}

pub fn jwt_key() -> String {
    env::var("JWT_PUBLIC_KEY").expect("JWT_PUBLIC_KEY env var not set")
}

pub async fn jwt_middlewware(request: Request, next: Next) -> Response {
    let key = match DecodingKey::from_rsa_pem(jwt_key().as_bytes()) {
        Err(e) => {
            println!("{:?}", e);
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::empty())
                .unwrap();
        }
        Ok(k) => k,
    };

    let cookies = CookieJar::from_headers(request.headers());

    let jwt = match cookies.get("authorization") {
        None => {
            return Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::empty())
                .unwrap()
        }
        Some(s) => s.value(),
    };

    match decode::<Claims>(jwt, &key, &Validation::new(Algorithm::RS256)) {
        Err(e) => {
            println!("{:?}", e);
            Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::empty())
                .unwrap()
        }
        Ok(_) => next.run(request).await,
    }
}
