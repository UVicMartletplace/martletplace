use fake::{
    faker::{
        internet::en::{Password, Username},
        lorem::en::{Paragraph, Sentence},
        name::en::Name,
    },
    Fake,
};
use goose::prelude::*;
use goose_eggs::{validate_and_load_static_assets, validate_page, Validate};
use rand::Rng;

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
    validate_page(user, signup_goose, validate)
        .await
        .expect("to be able to signup");
    let login_json = &serde_json::json!({
          "email": format!("{}@uvic.ca", username),
          "password": password,
          "totpCode": "123456",
    });
    let login_goose = user.post_json("/api/user/login", &login_json).await?;
    let validate = &Validate::builder().status(200).header("Set-Cookie").build();
    validate_page(user, login_goose, validate)
        .await
        .expect("to be able to login");
    Ok(())
}

async fn get_listing(user: &mut GooseUser) -> TransactionResult {
    let listing_id = rand::thread_rng().gen_range(1..=2000);
    let goose = user
        .get_named(&format!("/api/listing/{}", listing_id), "/api/listing/:id")
        .await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["listingID", "seller_profile", "title"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn create_listing(user: &mut GooseUser) -> TransactionResult {
    let fake_uuid: String = fake::uuid::UUIDv4.fake();
    let listing_json = &serde_json::json!({
          "title": Sentence(3..5).fake::<String>(),
          "description": Paragraph(3..5).fake::<String>(),
          "price": rand::thread_rng().gen_range(1..=1000),
          "location" : {
            "latitude": rand::thread_rng().gen_range(-90.0..=90.0),
            "longitude": rand::thread_rng().gen_range(-180.0..=180.0),
          },
          "images": [
            {
                "url": format!("/api/images/{}", fake_uuid),
            }
        ],
    });
    let request_body = &serde_json::json!({
        "listing": listing_json,
    });

    let goose = user.post_json("/api/listing", request_body).await?;
    let validate = &Validate::builder()
        .status(201)
        .texts(vec!["listing"])
        .build();
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

    let validate = &Validate::builder()
        .status(201)
        .texts(vec![
            "reviewerName",
            "stars",
            "comment",
            "userID",
            "listingID",
        ])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_review(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get_named("/api/review/1", "/api/review/:id").await?;
    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["review_id", "stars", "listingID"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_user(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get_named("/api/user/1", "/api/user/:id").await?;
    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["username", "name", "bio"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_charities(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/charities").await?;
    let validate = &Validate::builder().status(200).text("funds").build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_current_charity(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/charities/current").await?;
    let validate = &Validate::builder().status(200).text("funds").build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_message_threads(user: &mut GooseUser) -> TransactionResult {
    let goose = user
        .get_named("/api/messages/overview", "/api/messages/overview")
        .await?;

    let validate = &Validate::builder().status(200).build();
    validate_page(user, goose, validate).await?;
    Ok(())
}

/*
async fn get_recommendations(user: &mut GooseUser) -> TransactionResult {
    let goose = user
        .get_named("/api/recommendations", "/api/recommendations")
        .await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["listingID", "sellerID", "sellerName"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}
*/

async fn search_listings(user: &mut GooseUser) -> TransactionResult {
    let query = Sentence(3..5).fake::<String>();
    let latitude = rand::thread_rng().gen_range(-90.0..=90.0);
    let longitude = rand::thread_rng().gen_range(-180.0..=180.0);

    let url = format!(
        "/api/search?query={}&latitude={}&longitude={}",
        query, latitude, longitude
    );
    let goose = user.get_named(&url, "/api/search").await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["items", "totalItems"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

async fn get_index(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/").await?;

    let validate = &Validate::builder().status(200).build();
    validate_and_load_static_assets(user, goose, validate).await?;
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), GooseError> {
    const MAX_USERS: usize = 512;
    const STARTUP_TIME: usize = MAX_USERS / 4;
    const RUN_TIME: usize = MAX_USERS;

    GooseAttack::initialize()?
        .register_scenario(
            scenario!("Basic (authed)")
                .register_transaction(transaction!(get_index).set_weight(20)?)
                .register_transaction(transaction!(signup_login).set_on_start())
                //.register_transaction(transaction!(get_recommendations))
                .register_transaction(transaction!(get_listing).set_weight(20)?)
                .register_transaction(transaction!(create_listing))
                .register_transaction(transaction!(get_review).set_weight(10)?)
                .register_transaction(transaction!(create_review))
                .register_transaction(transaction!(get_user).set_weight(5)?)
                .register_transaction(transaction!(get_charities).set_weight(5)?)
                .register_transaction(transaction!(get_current_charity).set_weight(20)?)
                .register_transaction(transaction!(get_message_threads).set_weight(10)?)
                .register_transaction(transaction!(search_listings).set_weight(20)?),
        )
        .set_default(GooseDefault::Host, "http://local.martletplace.ca")?
        .set_default(
            GooseDefault::TestPlan,
            format!("0,0s;1,2s;{MAX_USERS},{STARTUP_TIME}s;{MAX_USERS},{RUN_TIME};0,0s").as_str(),
        )?
        .set_default(GooseDefault::ReportFile, "report.html")?
        .set_default(GooseDefault::NoScenarioMetrics, true)?
        .set_default(GooseDefault::NoTransactionMetrics, true)?
        .execute()
        .await?;

    Ok(())
}
