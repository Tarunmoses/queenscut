-- One-time local dev setup: creates a dedicated role + database for QueensCut
-- so the app never connects as the postgres superuser.
-- Run as the postgres superuser, e.g.:
--   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -p 5432 -f backend\db\setup\001_create_dev_db_and_role.sql

CREATE ROLE queenscut_dev WITH LOGIN PASSWORD 'queenscut_dev_local' CREATEDB;
CREATE DATABASE queenscut_dev OWNER queenscut_dev;
