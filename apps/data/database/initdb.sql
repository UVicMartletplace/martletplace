CREATE TYPE STATUS_TYPE AS ENUM ('AVAILABLE', 'SOLD');

CREATE TYPE LOCATION_TYPE AS (
    latitude float,
    longitude float
);

-- Creating Tables:

CREATE TABLE UserTable (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    name VARCHAR,
    bio TEXT,
    profile_pic_url VARCHAR,
    location VARCHAR,
    joining_date TIMESTAMP DEFAULT NOW(),
    listings_sold INTEGER[],
    listings_purchased INTEGER[]
);

CREATE TABLE ListingTable (
    listing_id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES UserTable(user_id),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    price INTEGER NOT NULL,
    location LOCATION_TYPE,
    status STATUS_TYPE,
    date_created TIMESTAMP DEFAULT NOW(),
    date_modified TIMESTAMP,
    image_urls TEXT[]
);

CREATE TABLE MessageTable (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES UserTable(user_id),
    receiver_id INTEGER REFERENCES UserTable(user_id),
    listing_id INTEGER REFERENCES ListingTable(listing_id),
    message_body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE RatingTable (
    rating_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES ListingTable(listing_id),
    user_id INTEGER REFERENCES UserTable(user_id) ON DELETE CASCADE,
    review TEXT,
    rating_value INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT NOW(),
    date_modified TIMESTAMP
);

CREATE TABLE UserPreferencesTable (
    user_id INTEGER REFERENCES UserTable(user_id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES ListingTable(listing_id),
    weight INTEGER,
    date_modified TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE SearchHistoryTable (
    user_id INTEGER REFERENCES UserTable(user_id) ON DELETE CASCADE,
    search_date TIMESTAMP NOT NULL,
    search_term VARCHAR NOT NULL,
    PRIMARY KEY (user_id, search_date)
);