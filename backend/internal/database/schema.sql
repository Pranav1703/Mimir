CREATE EXTENSION IF NOT EXISTS vector;

create table if not exists users (
    id uuid primary key default uuidv7(),
    username varchar(100) unique not null,
    password varchar(200) not null
);


