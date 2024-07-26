INSERT INTO users (username, email, password, totp_secret, name, bio, profile_pic_url, verified, ignore_charity_listings) VALUES
('deleted_user', 'deleted@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'Deleted User', '', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper', TRUE, FALSE),
('unverified', 'unverified@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'Unverified User', 'Hi! Im an unverified user!', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Kiki', FALSE, FALSE),
('user3', 'user3@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Three', 'Bio for user three', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Lucy', TRUE, FALSE),
('user4', 'user4@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Four', 'Bio for user four', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Angel', TRUE, FALSE),
('user5', 'user5@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Five', 'Bio for user five', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Casper', TRUE, FALSE);
-- ALL PASSWORDS: Letmeinfortesting1!


INSERT INTO charities(name, description, start_date, end_date, image_url) VALUES
('Charity One', 'A nice clever description for a drab default charity', '2024-01-01', '2027-12-31', 'https://api.dicebear.com/8.x/avataaars/svg?seed=CharityOne'),
('ScottMagic', 'We will make sure Scott never forgets his Magic cards again', '2022-01-01', '2022-06-14', 'https://api.dicebear.com/8.x/avataaars/svg?seed=CharityTwo'),
('Bikes4Kids', 'Buying little bicycles for poor little children', '2022-06-15', '2022-06-18', 'https://api.dicebear.com/8.x/avataaars/svg?seed=CharityThree'),
('Little Treat', 'Fundraise so Anika can afford to have a little treat :-) <3', '2022-06-19', '2022-12-31', 'https://api.dicebear.com/8.x/avataaars/svg?seed=CharityFour'),
('Evil Charity', 'We are going to do evil stuff muahahaha', '2023-01-01', '2023-12-31', 'https://api.dicebear.com/8.x/avataaars/svg?seed=CharityFive');

INSERT INTO organizations (name, logo_url, donated, receiving, charity_id) VALUES
('JPetStore', 'https://api.dicebear.com/8.x/avataaars/svg?seed=OrganizationOne', 100, FALSE, 1),
('Costco', 'https://api.dicebear.com/8.x/avataaars/svg?seed=OrganizationTwo', 419.68, TRUE, 1),
('Moms Against Seedless Watermelons', 'https://api.dicebear.com/8.x/avataaars/svg?seed=OrganizationFour', 0.01, TRUE, 2),
('Seedless Watermelons Against Moms', 'https://api.dicebear.com/8.x/avataaars/svg?seed=OrganizationFive', 12345678.49, FALSE, 4);

INSERT INTO listings (seller_id, buyer_id, charity_id, title, description, price, location, status, image_urls) VALUES
(1, NULL, 1, 'Listing One', 'Description for listing one', 100, ROW(40.7128, -74.0060), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Jasper', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella']),
(2, 3, 1, 'Listing Two', 'Description for listing two', 200, ROW(34.0522, -118.2437), 'SOLD', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Lucy']),
(3, 4, 1, 'Listing Three', 'Description for listing three', 300, ROW(41.8781, -87.6298), 'REMOVED', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Angel']),
(4, NULL, NULL, 'Listing Four', 'Description for listing four', 400, ROW(29.7604, -95.3698), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Casper']),
(5, NULL, NULL, 'Listing Five', 'Description for listing five', 500, ROW(51.5074, -0.1278), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Kiki']);

INSERT INTO messages (sender_id, receiver_id, listing_id, message_body) VALUES
(2, 1, 1, 'You still offering this???'),
(1, 2, 1, 'Yep'),
(1, 2, 1, 'You gonna cough up though?'),
(5, 1, 1, 'Single message'),
(4, 1, 1, 'You still gonna sell this?');

INSERT INTO reviews (listing_id, user_id, review, rating_value) VALUES
(1, 1, 'Terrible product, really', 5),
(1, 2, 'It worked fine', 4),
(2, 2, 'oooh, me likey', 4),
(3, 3, 'Meh, it worked', 3),
(4, 4, 'Are you fing kidding me???', 2),
(5, 5, 'Hahahahaha, no way', 1);

INSERT INTO user_preferences (user_id, listing_id, weight) VALUES
(1, 1, 0.5),
(2, 2, 0.6),
(3, 3, 0.7),
(4, 4, 0.8),
(5, 5, 0.9);

INSERT INTO user_searches (user_id, search_term) VALUES
(1, 'laptop'),
(2, 'funky hat'),
(3, 'textbook'),
(4, 'FUNNY THING'),
(5, 'Unverified User');