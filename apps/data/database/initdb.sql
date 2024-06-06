CREATE TYPE STATUS_TYPE AS ENUM ('AVAILABLE', 'SOLD');

CREATE TYPE LOCATION_TYPE AS (
    latitude float,
    longitude float
);

-- Create User table
CREATE TABLE User (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    name VARCHAR,
    bio TEXT,
    profile_pic_url VARCHAR,
    location VARCHAR,
    joining_date TIMESTAMP DEFAULT NOW,
    listings_sold INTEGER[],
    listings_purchased INTEGER[]
);

-- Create Listing table
CREATE TABLE Listing (
    listing_id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES User(user_id),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    price INTEGER NOT NULL,
    location LOCATION_TYPE,
    status status_type,
    date_created TIMESTAMP DEFAULT NOW,
    date_modified TIMESTAMP,
    image_urls TEXT[]
);

-- Create Message table
CREATE TABLE Message (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES User(user_id),
    receiver_id INTEGER REFERENCES User(user_id),
    listing_id INTEGER REFERENCES Listing(listing_id),
    message_body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT NOW
);

-- Create Rating table
CREATE TABLE Rating (
    rating_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES Listing(listing_id),
    user_id INTEGER REFERENCES User(user_id),
    review TEXT,
    rating_value INTEGER NOT NULL,
    date_created TIMESTAMP DEFAULT NOW,
    date_modified TIMESTAMP
);

-- Create UserPreferences table
CREATE TABLE UserPreferences (
    user_id INTEGER REFERENCES User(user_id),
    listing_id INTEGER REFERENCES Listing(listing_id),
    weight INTEGER,
    date_modified TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
);

-- Create SearchHistory table
CREATE TABLE SearchHistory (
    user_id INTEGER REFERENCES User(user_id),
    search_date TIMESTAMP NOT NULL,
    search_term VARCHAR NOT NULL,
    PRIMARY KEY (user_id, search_date)
);