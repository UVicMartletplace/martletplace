INSERT INTO users (username, email, password, totp_secret, name, bio, profile_pic_url, verified, ignore_charity_listings) VALUES
('deleted_user', 'deleted@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'Deleted User', '', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper', TRUE, FALSE),
('unverified', 'unverified@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'Unverified User', 'Hi! Im an unverified user!', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Kiki', FALSE, FALSE),
('user3', 'user3@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Three', 'Bio for user three', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Lucy', TRUE, FALSE),
('user4', 'user4@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Four', 'Bio for user four', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Angel', TRUE, FALSE),
('user5', 'user5@uvic.ca', '$2y$10$lYlKQyI0mGafc1BFZQTIUuLtQCksI2d84GqPDujv/FqxWnIzhVVVy', 'NICESTRONGSECRET', 'User Five', 'Bio for user five', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Casper', TRUE, FALSE);
-- ALL PASSWORDS: Letmeinfortesting1!

INSERT INTO charities(name, description, start_date, end_date, image_url) VALUES
('Safe Paws', 'Rescues and rehabilitates abandoned and mistreated animals, providing them with loving homes.', '2024-01-01', '2024-08-31', 'https://pawsgh.org/wp-content/uploads/2023/03/paw-gcebcf0324_640.png'),
('Hope Haven', 'Provides shelter and resources to homeless families and individuals.', '2022-01-01', '2022-06-14', 'https://api.dicebear.com/8.x/icons/svg?seed=CharityTwo'),
('Bikes4Kids', 'Buying little bicycles for poor little children.', '2022-06-15', '2022-06-18', 'https://api.dicebear.com/8.x/icons/svg?seed=CharityThree'),
('Green Earth Alliance', 'Focuses on environmental conservation and sustainability projects worldwide.', '2022-06-19', '2022-12-31', 'https://api.dicebear.com/8.x/icons/svg?seed=CharityFour'),
('Wellness for All', 'Promotes mental health awareness and provides counseling services to underserved communities.', '2023-01-01', '2023-12-31', 'https://api.dicebear.com/8.x/icons/svg?seed=CharityFive');

INSERT INTO organizations (name, logo_url, donated, receiving, charity_id) VALUES
('JPetStore', 'https://api.dicebear.com/8.x/icons/svg?seed=OrganizationOne', 100, TRUE, 1),
('Costco', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/1280px-Costco_Wholesale_logo_2010-10-26.svg.png', 419.68, FALSE, 1),
('Bluesky', 'https://api.dicebear.com/8.x/icons/svg?seed=OrganizationFour', 0.01, TRUE, 2),
('Tesla', 'https://api.dicebear.com/8.x/icons/svg?seed=OrganizationFive', 12345678.49, FALSE, 4);

INSERT INTO listings (seller_id, buyer_id, charity_id, title, description, price, location, status, image_urls) VALUES
(1, NULL, 1, 'Listing One', 'Description for listing one', 100, ROW(48.48256, -123.3234215), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Jasper', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella', 'https://api.dicebear.com/8.x/bottts/svg?seed=Bella']),
(2, 3, 1, 'Listing Two', 'Description for listing two', 200, ROW(48.4835652, -123.3234215), 'SOLD', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Lucy']),
(3, 4, 1, 'Listing Three', 'Description for listing three', 300, ROW(48.4845652, -123.3234215), 'REMOVED', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Angel']),
(4, NULL, NULL, 'Listing Four', 'Description for listing four', 400, ROW(48.4815652, -123.3234215), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Casper']),
(5, NULL, NULL, 'Listing Five', 'Description for listing five', 500, ROW(48.4805652, -123.3234215), 'AVAILABLE', ARRAY['https://api.dicebear.com/8.x/bottts/svg?seed=Kiki']);


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