FROM docker.elastic.co/elasticsearch/elasticsearch:8.13.4

HEALTHCHECK CMD curl -kf https://elastic:$ELASTIC_PASSWORD@localhost:8311/_cluster/health

COPY elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
