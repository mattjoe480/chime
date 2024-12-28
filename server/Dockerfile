FROM  rustlang/rust:nightly-slim as builder
LABEL authors="invin"

WORKDIR /usr/src/server

COPY Cargo.toml build.rs ./

RUN apt-get update && apt-get install -y protobuf-compiler musl-tools
RUN rustup target add x86_64-unknown-linux-musl
COPY ./src ./src

RUN cargo build --target x86_64-unknown-linux-musl --release && rm -rf src

FROM amazonlinux:latest

COPY --from=builder /usr/src/server/target/x86_64-unknown-linux-musl/release/server /usr/local/bin/

EXPOSE 8080
EXPOSE 50051

CMD ["server"]