-- Tạo database cho từng service
CREATE DATABASE auth_service;
-- Cấp quyền đầy đủ cho user postgres
GRANT ALL PRIVILEGES ON DATABASE auth_service TO postgres;


CREATE DATABASE general_service;
-- Cấp toàn quyền cho user postgres trên database general_service
GRANT ALL PRIVILEGES ON DATABASE general_service TO postgres;


CREATE DATABASE inventory_service;
-- Cấp toàn quyền cho user postgres trên database inventory_service
GRANT ALL PRIVILEGES ON DATABASE inventory_service TO postgres;

CREATE DATABASE business_service;
-- Cấp toàn quyền cho user postgres trên database business_service
GRANT ALL PRIVILEGES ON DATABASE business_service TO postgres;

CREATE DATABASE operation_service;
-- Cấp toàn quyền cho user postgres trên database operation_service
GRANT ALL PRIVILEGES ON DATABASE operation_service TO postgres;
