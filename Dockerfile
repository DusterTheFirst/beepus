FROM node:10.17.0 AS build
ADD . /app
WORKDIR /app
RUN yarn --non-interactive
RUN mv /app/src/config/secrets-example.json /app/src/config/secrets.json
RUN yarn build
RUN rm /app/build/config/secrets.json

FROM gcr.io/distroless/nodejs
COPY --from=build /app/build /app/build
COPY --from=build /app/views /app/views
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app

VOLUME [ "/app/db.sqlite" ]
VOLUME [ "/app/build/config/secrets.json" ]
EXPOSE 4747

CMD ["build/app.js"]