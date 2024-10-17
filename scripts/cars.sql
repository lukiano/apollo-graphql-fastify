CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL
);
CREATE INDEX idx_brand ON cars (brand);
CREATE UNIQUE INDEX idx_brand_model_unique ON cars (brand, model);