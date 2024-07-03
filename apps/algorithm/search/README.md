# Running the Search Engine

1. Clone repository.

2. In martletplace directory run `docker-compose down -v` to ensure no containers are running and any cached volumes are deleted.

3. In martletplace directory run `docker-compose up -–build`. This step may take a while (few minutes to build) as it is as large application.


4. Successful output looks like this at the end (takes a while):
```
	martletplace_database       | 2024-06-27 03:52:57.947 GMT [36] STATEMENT:  FETCH FORWARD 1 FROM "c_7fa83c326a80_3"
	martletplace_database       | 2024-06-27 03:52:57.947 GMT [36] LOG:  logical decoding found consistent point at 0/1C0BFD8
	martletplace_database       | 2024-06-27 03:52:57.947 GMT [36] DETAIL:  There are no running transactions.
	martletplace_database       | 2024-06-27 03:52:57.947 GMT [36] STATEMENT:  FETCH FORWARD 1 FROM "c_7fa83c326a80_3"
```

Failed build output contains this:
```
	martletplace_pgsync exited with code 1
```

If your output does not match the successful output or contains the failed output, try `docker compose down`, then run `docker-compose –build` again.

5. Once running, open your browser to localhost (no port necessary).

6. You will be prompted to create an account. Please follow the steps to do so, then sign in.

7. Once signed in and on the home page, try searching for different things through the search bar (ex. chocolate).

8. Open the filters tab next to the search bar and play around with the filters. Ensure to click “Apply Filters” and then the “Search” button.

   - Try searching with several different permutations of filters, clicking "Apply Filters" each time before clicking "Search".

   - While doing this, view the terminal output to see what requests are being made.

9. Try sorting functionality by clicking the “Sort By” button.

## To run automated tests:
Open a separate terminal and run `docker exec -it martletplace_search bash`

In the resulting bash terminal, run `pytest src/test_server.py`
