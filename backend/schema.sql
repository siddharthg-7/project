CREATE DATABASE IF NOT EXISTS smart_home_planner;
USE smart_home_planner;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS house_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plot_size VARCHAR(50),
  plot_shape VARCHAR(50),
  facing VARCHAR(20),
  floors INT,
  rooms INT,
  house_type VARCHAR(30),
  apartment_type VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  floor_name VARCHAR(50),
  vastu_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  floor_id INT NOT NULL,
  room_name VARCHAR(50),
  room_type VARCHAR(50),
  size_sqft INT,
  direction VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS parking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  car_slots INT,
  bike_slots INT,
  ev_slots INT,
  turning_radius VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS vastu_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  score INT,
  main_door VARCHAR(50),
  kitchen VARCHAR(50),
  bedroom VARCHAR(50),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  cement_cost DECIMAL(12,2),
  steel_cost DECIMAL(12,2),
  brick_cost DECIMAL(12,2),
  labour_cost DECIMAL(12,2),
  flooring_cost DECIMAL(12,2),
  parking_cost DECIMAL(12,2),
  total_budget DECIMAL(12,2)
);

CREATE TABLE IF NOT EXISTS apartments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  apartment_type VARCHAR(30),
  floor_number INT,
  entrance_direction VARCHAR(30),
  balcony_direction VARCHAR(30),
  parking_allocation VARCHAR(100)
);
