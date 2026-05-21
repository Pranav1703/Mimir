create table if not exists User (
    id uuid primary key default uuidv7(),
    username varchar(100) not null,
    password varchar(200) not null
);