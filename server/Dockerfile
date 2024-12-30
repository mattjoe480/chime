FROM clux/muslrust:nightly AS chef

LABEL MAINTAINER="mattjon480"
LABEL NAME="rust-server"
LABEL VERSION="0.1"

USER root

RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl --bin server --package server


FROM gcr.io/distroless/static-debian12:latest-amd64 AS runtime

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/server /usr/local/bin/
EXPOSE 8080
EXPOSE 50051

CMD ["server"]