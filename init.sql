-- Tạo database cho từng service
CREATE DATABASE auth_service;

-- Cấp quyền đầy đủ cho user postgres
GRANT ALL PRIVILEGES ON DATABASE auth_service TO postgres;
