FROM postgres:16-alpine

ENV POSTGRES_USER=martletplace

COPY ./postgresql.conf /etc/postgresql.conf

CMD [ "-c", "config_file=/etc/postgresql.conf" ]
