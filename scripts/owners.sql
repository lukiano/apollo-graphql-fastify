CREATE TABLE owners (
    owner_id SERIAL PRIMARY KEY,
    car_id INT NOT NULL,
    driver_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    color VARCHAR(50) NOT NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);