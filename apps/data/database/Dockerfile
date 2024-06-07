FROM postgres:16-alpine

COPY ./postgresql.conf /etc/postgresql.conf
COPY initdb.sql /docker-entrypoint-initdb.d/initdb.sql

CMD [ "-c", "config_file=/etc/postgresql.conf" ]
