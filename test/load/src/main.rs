use fake::{
    faker::{
        internet::en::{Password, Username},
        name::en::Name,
    },
    Fake,
};
use goose::prelude::*;
use goose_eggs::{validate_page, Validate};

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

async fn get_recommendations(user: &mut GooseUser) -> TransactionResult {
    let goose = user.get("/api/recommendations").await?;

    let validate = &Validate::builder()
        .status(200)
        .texts(vec!["listingID", "sellerID", "sellerName"])
        .build();
    validate_page(user, goose, validate).await?;

    Ok(())
}

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
                .register_transaction(transaction!(get_recommendations)),
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
