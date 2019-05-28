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
 badge INT,
 date VARCHAR(50),
 hours VARCHAR(10)
);

DROP TABLE IF EXISTS languages;
CREATE TABLE languages(
    ID SERIAL PRIMARY KEY,
    language VARCHAR(2),
    enName VARCHAR(15),
    name VARCHAR(15)
);
