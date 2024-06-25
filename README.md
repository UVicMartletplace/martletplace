# UVic MartletPlace

## Local Development

> [!NOTE]
> **BEFORE** you run the following steps make sure you have [`docker`](https://docs.docker.com/engine/install/) & the [`docker compose`](https://docs.docker.com/compose/install/#scenario-two-install-the-compose-plugin) plugin installed and running

```shell
# Clone the repository
git clone https://github.com/UVicMartletplace/martletplace && cd martletplace

# To start developing, run the docker compose stack
docker compose up --build
```

### Testing

Testing will run on each commit as part of each service's workflow.
To manually test, run the test.sh file in the root of the project. This will run all tests for all services sequentially.

The development environment is now running and accesible at [http://local.martletplace.ca/](http://local.martletplace.ca/)

## System Architecture

```mermaid
flowchart TD
    CB[Client Browser]

    subgraph frontend_rect["&nbsp"]
        W(Frontend)
    end

    P{{Proxy}}

    subgraph backend_rect["Backend"]
        LS(Listing Service)
        US(User Service)
        RS(Review Service)
        M(Messages)
    end

    subgraph algo_rect["Algorithm"]
        S(Search)
        R(Recommender)
    end

    D{{Data Layer}}

    subgraph db_rect["&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspResOps"]
        DB[(Database Cluster)]
        %%PGS(PGSync)
        E[(Elastic Search)]
        %%K[(Kafka Cluster)]
        C[(Cache Cluster)]
        BL[(Blob Store)]
    end

    CB -->|HTTP| W -->|HTTP /| P

    P -->|HTTP /api/search| S -->|HTTP| D
    P -->|HTTP /api/recommendations| R -->|HTTP/PG| D
    P -->|HTTP /api/listing| LS -->|HTTP/PG| D
    P -->|HTTP /api/user| US -->|HTTP/PG| D
    P -->|HTTP /api/review| RS -->|HTTP/PG| D
    P <-->|WS /api/messages| M <-->|HTTP/RPS| D

    D -->|PG| DB
    D -->|S3| BL
    D -->|HTTP| E
    D -->|RPS| C
    %%D <-->|KP| K

    style db_rect       stroke:#e91e63,stroke-width:3px,fill:none,stroke-dasharray:4,4
    style backend_rect  stroke:#9b59b6,stroke-width:3px,fill:none,stroke-dasharray:4,4
    style algo_rect     stroke:#2ecc71,stroke-width:3px,fill:none,stroke-dasharray:4,4
    style frontend_rect stroke:#3498db,stroke-width:3px,fill:none,stroke-dasharray:4,4
```
