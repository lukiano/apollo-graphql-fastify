CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    licence VARCHAR(20) NOT NULL
);
CREATE UNIQUE INDEX idx_licence_unique ON drivers(licence);