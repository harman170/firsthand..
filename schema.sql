-- Run this in MySQL Workbench (connected to defaultdb) to create all tables your server.js needs.
-- Make sure you have selected defaultdb: USE defaultdb;

USE defaultdb;

-- 1. users (signup / login)
CREATE TABLE IF NOT EXISTS users (
  email    VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255),
  userType VARCHAR(50),
  dos      DATE,
  status   INT DEFAULT 1
);

-- 2. client_profiles (company/client profile)
CREATE TABLE IF NOT EXISTS client_profiles (
  client_id       VARCHAR(50) PRIMARY KEY,
  name            VARCHAR(100),
  business        VARCHAR(100),
  business_profile VARCHAR(500),
  address         VARCHAR(300),
  city            VARCHAR(50),
  contact         VARCHAR(20),
  id_proof        VARCHAR(50),
  id_number       VARCHAR(50),
  other_info      VARCHAR(500)
);

-- 3. volkycc (volunteer KYC)
CREATE TABLE IF NOT EXISTS volkycc (
  txtemail1     VARCHAR(100) PRIMARY KEY,
  txtname       VARCHAR(100),
  txtcontact    VARCHAR(20),
  txtaddress    VARCHAR(300),
  city          VARCHAR(50),
  txtGender     VARCHAR(20),
  txtdob        DATE,
  idProofPath   VARCHAR(500),
  txtQual       VARCHAR(100),
  txtOccu       VARCHAR(100),
  txtInfo       VARCHAR(500),
  profilePicPath VARCHAR(500)
);

-- 4. jobs
CREATE TABLE IF NOT EXISTS jobs (
  jobid    INT AUTO_INCREMENT PRIMARY KEY,
  jobtitle VARCHAR(150),
  jobtype  VARCHAR(100),
  address  VARCHAR(300),
  city     VARCHAR(50),
  edu      VARCHAR(100),
  contact  VARCHAR(20)
);

-- Verify
SELECT 'Tables created.' AS message;
SHOW TABLES;
