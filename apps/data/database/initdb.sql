CREATE FUNCTION trigger_update_modified()
RETURNS TRIGGER AS $$ BEGIN
  NEW.modified_at = clock_timestamp();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TYPE STATUS_TYPE AS ENUM ('AVAILABLE', 'SOLD', 'REMOVED');

CREATE TYPE LOCATION_TYPE AS (
    lat float,
    lon float
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    totp_secret VARCHAR NOT NULL,
    name VARCHAR,
    bio TEXT,
    profile_pic_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ignore_charity_listings BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TRIGGER users_modified_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE charities (
    charity_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    image_url TEXT
);

CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(user_id),
    charity_id INTEGER REFERENCES charities(charity_id),
    title VARCHAR NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location LOCATION_TYPE NOT NULL,
    status STATUS_TYPE NOT NULL,
    description VARCHAR,
    image_urls TEXT [],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER listings_modified_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    receiver_id INTEGER NOT NULL REFERENCES users(user_id),
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    message_body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    review TEXT,
    rating_value INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reviews_modified_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE user_preferences (
    user_pref_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    weight decimal,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER user_preferences_modified_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE trigger_update_modified();

CREATE TABLE user_searches (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    search_term VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_clicks (
    click_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(listing_id),
    click_term VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    logo_url TEXT,
    donated DECIMAL(10, 2),
    receiving BOOLEAN,
    charity_id INTEGER NOT NULL REFERENCES charities(charity_id) ON DELETE CASCADE
);
