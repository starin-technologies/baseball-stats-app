CREATE DATABASE baseball_db;

\c baseball_db;

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    rank INT NOT NULL,
    player_name VARCHAR(80) NOT NULL,
    age INT NOT NULL,
    hits INT NOT NULL,
    year INT NOT NULL,
    bats VARCHAR(1) NOT NULL,
    description TEXT
);
