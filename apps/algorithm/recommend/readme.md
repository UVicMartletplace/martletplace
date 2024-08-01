# Recommendations Engine

The recommender is built using TensorFlow, with its API in FastAPI.

## Running Instructions

1. Clone the repository

2. Navigate into the repository

3. Run `docker-compose up --build`. This will start the Martletplace application,
   spinning up docker containers for all of the different parts. If there are any
   problems with this working, you may not have docker open, or there may be an
   application currently running on the ports necessary for this application to
   run.

4. Once the docker containers are all up, you may navigate around the recommender
   using the API endpoint (in your browser, Postman, or whatever you prefer):

   `GET http://localhost/api/recommendations?authorization=5`

   User 5 is the same user that will be used for the search endpoint, so it's
   important this user is in use (auth was not fully implemented in this spring). 

   If you would like to see the integration with frontend, you can navigate to
   the homepage at `http://localhost/`. Once you make an account, you can see
   the default recommendations. Perform a search using the search bar. Then, navigate back to the
   homepage, and notice that some of your recommendations have changed. The term
   you searched may appear in the title of these items, or their descriptions. Next, you can test
   recommendations based on clicks. If you're looking at the recommendations page and you click on
   an item, then you can go back to the homepage and see how the recommendations change by showing
   more of the same item you just clicked on. Finally, you can look at your recommended items, and
   choose that you're not interested in the given item. If you refresh your homepage, this recommendation
   will disappear along with "similar" recommendations, assuming the recommendation strength of the
   your searches and clicks doesn't overpower the similar not interested items, since not interested
   items are negated whereas searches and clicks are additive. For example, if you search up "banana"
   many times and click on many banana products, and choose to stop suggesting items similar to a
   banana product, chances are you will still see some banana products. 

## Testing Instructions

1. Do steps 1 to 3 in the "Running Instructions"

2. Run `docker compose exec recommend pytest`

3. View the output. The tests should succeed (they do on our machines and in the Actions workflow).
