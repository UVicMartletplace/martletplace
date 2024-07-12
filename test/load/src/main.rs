use fake::{
    faker::{
        internet::en::{Password, Username},
        lorem::en::{Paragraph, Sentence},
        name::en::Name,
    },
    Fake,
};
use goose::prelude::*;
use goose_eggs::{validate_page, Validate};
use rand::Rng;

// BACKEND

async fn signup_login(user: &mut GooseUser) -> TransactionResult {
    let username = Username().fake::<String>();
    let password = format!(
        "{}aA1!",
        Password(std::ops::Range { start: 4, end: 8 }).fake::<String>()
    );
    let signup_json = &serde_json::json!({
          "name": Name().fake::<String>(),
          "username": username,
          "email": format!("{}@uvic.ca", username),
          "password": password,
    });
    let signup_goose = user.post_json("/api/user", &signup_json).await?;

    let validate = &Validate::builder().status(201).build();
    validate_page(user, signup_goose, validate).await?;

    let login_json = &serde_json::json!({
          "email": format!("{}@uvic.ca", username),
          "password": password,
    });
    let login_goose = user.post_json("/api/user/login", &login_json).await?;

    let validate = &Validate::builder().status(200).header("Set-Cookie").build();
    validate_page(user, login_goose, validate).await?;

    Ok(())
}

async fn get_listing(user: &mut GooseUser) -> TransactionResult {
    // get random listing id between 1-2000
    let listing_id = rand::thread_rng().gen_range(1..=2000);
    let goose = user.get(&format!("/api/listing/{}", listing_id)).await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["listingID", "seller_profile", "title"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn create_listing(user: &mut GooseUser) -> TransactionResult {
    let listing_json = &serde_json::json!({
          "title": Sentence(3..5).fake::<String>(),
          "description": Paragraph(3..5).fake::<String>(),
          "price": rand::thread_rng().gen_range(1..=1000),
          "latitude": rand::thread_rng().gen_range(-90.0..=90.0),
          "longitude": rand::thread_rng().gen_range(-180.0..=180.0),
    });
    let request_body = &serde_json::json!({
        "listing": listing_json,
        "images": [],
    });
    let goose = user.post_json("/api/listing", request_body).await?;
    let validate = &Validate::builder().status(201).build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn create_review(user: &mut GooseUser) -> TransactionResult {
    let listing_id = rand::thread_rng().gen_range(1..=2000);
    let review_json = &serde_json::json!({
          "stars": rand::thread_rng().gen_range(1..=5),
          "comment": Paragraph(3..5).fake::<String>(),
          "listingID": listing_id,
    });
    let goose = user.post_json("/api/review", review_json).await?;

    let validate = &Validate::builder().status(201).build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_user(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/user/1").await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["userID", "username", "name"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_message_threads(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/messages").await?;

    let validate = &Validate::builder().status(200).build();
    validate_page(user, goose, validate).await?;
    Ok(())
}

// ALGO

async fn get_recommendations(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/recommendations").await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["listingID", "sellerID", "sellerName"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn stop_recommending(user: &mut GooseUser) -> TransactionResult {
    let listing_id = rand::thread_rng().gen_range(1..=2000);
    let goose = user
        .get(&format!("/api/recommendations/stop/{}", listing_id))
        .await?;

    let validate = &Validate::builder().status(200).build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn search_listings(user: &mut GooseUser) -> TransactionResult {
    let search_body = &serde_json::json!({
          "query": Sentence(3..5).fake::<String>(),
          "latitude": rand::thread_rng().gen_range(-90.0..=90.0),
          "longitude": rand::thread_rng().gen_range(-180.0..=180.0),
    });

    let goose = user.post_json("/api/search", search_body).await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["items", "totalItems"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_search_history(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/1/search-history").await?;

    let validate = &Validate::builder().status(200).build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

// FRONTEND

async fn get_index(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/").await?;

    let validate = &Validate::builder().status(200).build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), GooseError> {
    GooseAttack::initialize()?
        .register_scenario(
            scenario!("Basic (authed)")
                .register_transaction(transaction!(get_index))
                .register_transaction(transaction!(signup_login))
                .register_transaction(transaction!(get_recommendations))
                .register_transaction(transaction!(get_listing))
                .register_transaction(transaction!(create_listing))
                .register_transaction(transaction!(create_review))
                .register_transaction(transaction!(get_user))
                .register_transaction(transaction!(get_message_threads))
                .register_transaction(transaction!(stop_recommending))
                .register_transaction(transaction!(search_listings))
                .register_transaction(transaction!(get_search_history)),
        )
        .set_default(GooseDefault::Host, "http://local.martletplace.ca")?
        .set_default(GooseDefault::Users, 256)?
        .set_default(GooseDefault::StartupTime, 32)?
        .set_default(GooseDefault::RunTime, 16)?
        .set_default(GooseDefault::NoResetMetrics, true)?
        .set_default(GooseDefault::ReportFile, "report.html")?
        .execute()
        .await?;

    Ok(())
}
