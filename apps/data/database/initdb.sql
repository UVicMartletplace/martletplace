CREATE FUNCTION trigger_update_modified()
RETURNS TRIGGER AS $$ BEGIN
  NEW.modified_at = clock_timestamp();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TYPE STATUS_TYPE AS ENUM ('AVAILABLE', 'SOLD', 'REMOVED');

CREATE TYPE LOCATION_TYPE AS (
    latitude float,
    longitude float
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    name VARCHAR,
    bio TEXT,
    profile_pic_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER users_modified_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(user_id),
    title VARCHAR NOT NULL,
    price INTEGER NOT NULL,
    location LOCATION_TYPE NOT NULL,
    status STATUS_TYPE NOT NULL,
    description VARCHAR,
    image_urls TEXT [],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_buyer_id ON listings(buyer_id);
CREATE INDEX idx_listings_status ON listings(status);

CREATE TRIGGER listings_modified_at BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    receiver_id INTEGER NOT NULL REFERENCES users(user_id),
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    message_body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    review TEXT,
    rating_value INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE TRIGGER reviews_modified_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE user_preferences (
    user_pref_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    weight decimal,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE TRIGGER user_preferences_modified_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE user_searches (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    search_term VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id);

CREATE TABLE user_clicks (
    click_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_clicks_user_id ON user_clicks(user_id);
