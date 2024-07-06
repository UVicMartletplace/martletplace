use axum::{
    body::Bytes,
    extract::{DefaultBodyLimit, Path},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use std::{
    fs::{self, File},
    io::{Read, Write},
};
use tower_http::catch_panic::CatchPanicLayer;
use uuid::Uuid;

#[derive(Serialize)]
struct CreateImageResponse {
    url: String,
}

pub fn image_router() -> Router {
    Router::new()
        .route("/api/images", post(upload_image_handler))
        .layer(DefaultBodyLimit::disable())
        .route("/api/images/:id", get(get_image_handler))
        .layer(CatchPanicLayer::new())
}

async fn upload_image_handler(body: Bytes) -> impl IntoResponse {
    println!("RECIEVED FILE");
    let uuid = Uuid::new_v4();
    let dir_path = std::path::Path::new("images");
    let file_path = dir_path.join(format!("{}", uuid));
    if !dir_path.exists() {
        fs::create_dir_all(dir_path).expect("to be able to create images dir");
    }

    let mut file = File::create(file_path).expect("to create a file with the UUID name");
    file.write_all(&body)
        .expect("to be able to write to the file");
    let resp = CreateImageResponse {
        url: format!("/api/images/{}", uuid),
    };
    println!("WROTE TO FILE: {:?}, {}", uuid, body.len());
    (StatusCode::CREATED, Json(resp))
}

async fn get_image_handler(Path(id): Path<String>) -> impl IntoResponse {
    if Uuid::parse_str(&id).is_err() {
        return (StatusCode::BAD_REQUEST, "UUID not valid").into_response();
    };

    let dir_path = std::path::Path::new("images");
    let file_path = dir_path.join(id);
    let mut file = match File::open(file_path) {
        Ok(file) => file,
        Err(_) => return (StatusCode::NOT_FOUND, "File not found").into_response(),
    };
    let mut buffer = Vec::new();
    if file.read_to_end(&mut buffer).is_err() {
        return (StatusCode::INTERNAL_SERVER_ERROR).into_response();
    }

    (StatusCode::OK, buffer).into_response()
}
