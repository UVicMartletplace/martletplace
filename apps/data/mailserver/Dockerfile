FROM alpine:3.20

RUN apk add postfix

COPY main.cf /etc/postfix/main.cf

CMD postfix start-fg
