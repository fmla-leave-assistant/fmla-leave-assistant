DROP TABLE IF EXISTS base_hours;
CREATE TABLE base_hours;
  id SERIAL PRIMARY KEY,
  boss VARCHAR(100),
  name VARCHAR(100),
  badge INT,
  sick_leave DECIMAL(10, 4),
  rdo VARCHAR(20),
  first VARCHAR(10),
  second VARCHAR(10)
);