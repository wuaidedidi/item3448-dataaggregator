SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS summary_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE summary_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) DEFAULT '',
    email VARCHAR(100) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    role ENUM('admin', 'user') DEFAULT 'user',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 数据表元信息
CREATE TABLE IF NOT EXISTS data_table_meta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 数据列元信息
CREATE TABLE IF NOT EXISTS data_column_meta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    data_type ENUM('number', 'string', 'date') DEFAULT 'string',
    is_summable TINYINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    UNIQUE KEY uk_table_column (table_name, column_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 投资数据表A
CREATE TABLE IF NOT EXISTS investment_table_a (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL COMMENT '项目名称',
    industry_code VARCHAR(50) DEFAULT '' COMMENT '项目行业代码',
    planned_total_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '计划总投资(万元)',
    current_year_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '本年完成投资(万元)',
    completed_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计完成投资(万元)',
    project_type VARCHAR(100) DEFAULT '' COMMENT '项目类型',
    region VARCHAR(100) DEFAULT '' COMMENT '所在地区',
    start_date DATE DEFAULT NULL COMMENT '开工日期',
    project_status VARCHAR(50) DEFAULT '在建' COMMENT '项目状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 投资数据表B
CREATE TABLE IF NOT EXISTS investment_table_b (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL COMMENT '项目名称',
    industry_code VARCHAR(50) DEFAULT '' COMMENT '项目行业代码',
    planned_total_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '计划总投资(万元)',
    current_year_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '本年完成投资(万元)',
    completed_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计完成投资(万元)',
    project_type VARCHAR(100) DEFAULT '' COMMENT '项目类型',
    region VARCHAR(100) DEFAULT '' COMMENT '所在地区',
    start_date DATE DEFAULT NULL COMMENT '开工日期',
    project_status VARCHAR(50) DEFAULT '在建' COMMENT '项目状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 投资数据表C
CREATE TABLE IF NOT EXISTS investment_table_c (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL COMMENT '项目名称',
    industry_code VARCHAR(50) DEFAULT '' COMMENT '项目行业代码',
    planned_total_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '计划总投资(万元)',
    current_year_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '本年完成投资(万元)',
    completed_investment DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计完成投资(万元)',
    project_type VARCHAR(100) DEFAULT '' COMMENT '项目类型',
    region VARCHAR(100) DEFAULT '' COMMENT '所在地区',
    start_date DATE DEFAULT NULL COMMENT '开工日期',
    project_status VARCHAR(50) DEFAULT '在建' COMMENT '项目状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 种子数据 ==========

-- 管理员用户 (密码将由PHP启动时重新hash，此处为占位)
INSERT INTO users (username, password, nickname, role, status) VALUES
('admin', '$2y$10$placeholder', '系统管理员', 'admin', 1);

-- 数据表元信息
INSERT INTO data_table_meta (table_name, display_name, description, is_active) VALUES
('investment_table_a', '投资数据表A', '基础设施与公共服务投资项目数据', 1),
('investment_table_b', '投资数据表B', '工业与制造业投资项目数据', 1),
('investment_table_c', '投资数据表C', '科技与新兴产业投资项目数据', 1);

-- 数据列元信息
INSERT INTO data_column_meta (table_name, column_name, display_name, data_type, is_summable, sort_order) VALUES
('investment_table_a', 'project_name', '项目名称', 'string', 0, 1),
('investment_table_a', 'industry_code', '项目行业代码', 'string', 0, 2),
('investment_table_a', 'planned_total_investment', '计划总投资(万元)', 'number', 1, 3),
('investment_table_a', 'current_year_investment', '本年完成投资(万元)', 'number', 1, 4),
('investment_table_a', 'completed_investment', '累计完成投资(万元)', 'number', 1, 5),
('investment_table_a', 'project_type', '项目类型', 'string', 0, 6),
('investment_table_a', 'region', '所在地区', 'string', 0, 7),
('investment_table_a', 'start_date', '开工日期', 'date', 0, 8),
('investment_table_a', 'project_status', '项目状态', 'string', 0, 9),
('investment_table_b', 'project_name', '项目名称', 'string', 0, 1),
('investment_table_b', 'industry_code', '项目行业代码', 'string', 0, 2),
('investment_table_b', 'planned_total_investment', '计划总投资(万元)', 'number', 1, 3),
('investment_table_b', 'current_year_investment', '本年完成投资(万元)', 'number', 1, 4),
('investment_table_b', 'completed_investment', '累计完成投资(万元)', 'number', 1, 5),
('investment_table_b', 'project_type', '项目类型', 'string', 0, 6),
('investment_table_b', 'region', '所在地区', 'string', 0, 7),
('investment_table_b', 'start_date', '开工日期', 'date', 0, 8),
('investment_table_b', 'project_status', '项目状态', 'string', 0, 9),
('investment_table_c', 'project_name', '项目名称', 'string', 0, 1),
('investment_table_c', 'industry_code', '项目行业代码', 'string', 0, 2),
('investment_table_c', 'planned_total_investment', '计划总投资(万元)', 'number', 1, 3),
('investment_table_c', 'current_year_investment', '本年完成投资(万元)', 'number', 1, 4),
('investment_table_c', 'completed_investment', '累计完成投资(万元)', 'number', 1, 5),
('investment_table_c', 'project_type', '项目类型', 'string', 0, 6),
('investment_table_c', 'region', '所在地区', 'string', 0, 7),
('investment_table_c', 'start_date', '开工日期', 'date', 0, 8),
('investment_table_c', 'project_status', '项目状态', 'string', 0, 9);

-- 投资数据表A - 基础设施与公共服务
INSERT INTO investment_table_a (project_name, industry_code, planned_total_investment, current_year_investment, completed_investment, project_type, region, start_date, project_status) VALUES
('城市轨道交通4号线工程', '1000', 1500000.00, 320000.00, 680000.00, '新建', '东城区', '2024-03-15', '在建'),
('市政供水管网改造项目', '1000', 85000.00, 42000.00, 62000.00, '改扩建', '西城区', '2024-06-01', '在建'),
('高速公路连接线建设', '1100', 620000.00, 180000.00, 350000.00, '新建', '朝阳区', '2023-09-20', '在建'),
('污水处理厂升级改造', '1000', 45000.00, 28000.00, 38000.00, '改扩建', '海淀区', '2024-01-10', '在建'),
('社区卫生服务中心建设', '2000', 12000.00, 8000.00, 10000.00, '新建', '丰台区', '2024-05-20', '在建'),
('城市公园绿化提升工程', '2000', 8500.00, 5200.00, 7800.00, '改扩建', '石景山区', '2024-04-01', '完工'),
('教育产业园基础设施', '2100', 95000.00, 35000.00, 55000.00, '新建', '通州区', '2024-02-28', '在建'),
('养老服务综合体项目', '2000', 36000.00, 15000.00, 22000.00, '新建', '大兴区', '2024-07-15', '在建'),
('智慧交通指挥中心', '1100', 28000.00, 18000.00, 25000.00, '新建', '东城区', '2024-03-01', '在建'),
('雨污分流改造工程', '1000', 52000.00, 30000.00, 42000.00, '改扩建', '西城区', '2024-08-10', '在建'),
('公共体育场馆建设', '2100', 75000.00, 25000.00, 40000.00, '新建', '朝阳区', '2024-06-20', '在建'),
('农村公路提档升级', '1100', 32000.00, 20000.00, 28000.00, '改扩建', '顺义区', '2024-04-15', '在建');

-- 投资数据表B - 工业与制造业
INSERT INTO investment_table_b (project_name, industry_code, planned_total_investment, current_year_investment, completed_investment, project_type, region, start_date, project_status) VALUES
('新能源汽车生产基地', '3000', 980000.00, 280000.00, 520000.00, '新建', '经开区', '2023-11-01', '在建'),
('精密机械制造产业园', '3100', 450000.00, 120000.00, 280000.00, '新建', '顺义区', '2024-01-15', '在建'),
('食品加工产业集群', '3200', 180000.00, 65000.00, 120000.00, '新建', '大兴区', '2024-03-20', '在建'),
('医药制造研发中心', '3000', 320000.00, 95000.00, 180000.00, '新建', '海淀区', '2024-02-01', '在建'),
('智能装备制造基地', '3100', 550000.00, 160000.00, 320000.00, '新建', '昌平区', '2023-12-10', '在建'),
('绿色建材生产线', '3200', 120000.00, 48000.00, 85000.00, '改扩建', '房山区', '2024-05-01', '在建'),
('电子元器件封装厂', '3000', 280000.00, 85000.00, 150000.00, '新建', '经开区', '2024-04-10', '在建'),
('纺织印染升级项目', '3200', 65000.00, 32000.00, 50000.00, '改扩建', '通州区', '2024-06-15', '在建'),
('化工新材料产业园', '3100', 420000.00, 130000.00, 260000.00, '新建', '大兴区', '2024-01-20', '在建'),
('航空零部件制造', '3000', 680000.00, 200000.00, 380000.00, '新建', '顺义区', '2023-10-15', '在建');

-- 投资数据表C - 科技与新兴产业
INSERT INTO investment_table_c (project_name, industry_code, planned_total_investment, current_year_investment, completed_investment, project_type, region, start_date, project_status) VALUES
('人工智能创新中心', '4000', 250000.00, 85000.00, 130000.00, '新建', '海淀区', '2024-02-15', '在建'),
('5G基站建设工程', '4100', 180000.00, 95000.00, 140000.00, '新建', '朝阳区', '2024-01-01', '在建'),
('大数据产业园区', '4000', 320000.00, 110000.00, 180000.00, '新建', '经开区', '2024-03-10', '在建'),
('生物医药研发平台', '4200', 150000.00, 55000.00, 90000.00, '新建', '昌平区', '2024-04-20', '在建'),
('新能源储能电站', '4100', 420000.00, 150000.00, 250000.00, '新建', '大兴区', '2023-11-20', '在建'),
('量子计算实验室', '4000', 88000.00, 35000.00, 50000.00, '新建', '海淀区', '2024-06-01', '在建'),
('智慧城市运营中心', '4100', 135000.00, 62000.00, 95000.00, '新建', '东城区', '2024-05-15', '在建'),
('半导体芯片设计中心', '4000', 560000.00, 180000.00, 300000.00, '新建', '经开区', '2024-01-25', '在建'),
('碳中和技术研发基地', '4200', 210000.00, 75000.00, 120000.00, '新建', '房山区', '2024-07-01', '在建'),
('工业互联网平台', '4100', 95000.00, 42000.00, 65000.00, '新建', '朝阳区', '2024-03-25', '在建'),
('光伏组件智能工厂', '4200', 380000.00, 130000.00, 220000.00, '新建', '顺义区', '2024-02-10', '在建');
