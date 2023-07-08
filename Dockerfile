FROM node:20-alpine3.17 as builder

COPY . /fsg
WORKDIR /fsg
RUN npm install
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /fsg/dist /usr/share/nginx/html

EXPOSE 80
