COPY listings(seller_id, buyer_id, title, description, price, location, status, image_urls)
FROM '/docker-entrypoint-initdb.d/recommender/trainingData.csv'
DELIMITER ','
CSV HEADER;
