DROP TABLE IF EXISTS base_hours;
CREATE TABLE base_hours(
  id SERIAL PRIMARY KEY,
  boss VARCHAR(100),
  name VARCHAR(100),
  badge INT,
  sick_leave DECIMAL(10, 4),
  rdo VARCHAR(20),
  first VARCHAR(10),
  second VARCHAR(10)
);

DROP TABLE IF EXISTS hastis;
CREATE TABLE hastis(
  id SERIAL PRIMARY KEY,
  boss VARCHAR(100),
  name VARCHAR(100),
  badge INT,
  rdo VARCHAR(20),
  date VARCHAR(50),
  SL VARCHAR(10),
  VL VARCHAR(10),
  AC VARCHAR(10),
  LWOP VARCHAR(10),
  PPL VARCHAR(10)
);

DROP TABLE IF EXISTS languages;
CREATE TABLE languages(
    ID SERIAL PRIMARY KEY,
    language VARCHAR(2),
    enName VARCHAR(15),
    name VARCHAR(15),
);
