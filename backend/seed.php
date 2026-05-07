<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use App\Core\Logger;

$logger = Logger::getInstance();
$logger->info("Running database seed script...");

$host = getenv('DB_HOST') ?: 'db';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'summary_system';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: 'root';

$maxRetries = 30;
$pdo = null;

for ($i = 0; $i < $maxRetries; $i++) {
    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        ]);
        $logger->info("Database connection established");
        break;
    } catch (PDOException $e) {
        $logger->info("Waiting for database... attempt " . ($i + 1) . "/{$maxRetries}");
        sleep(2);
    }
}

if ($pdo === null) {
    $logger->error("Failed to connect to database after {$maxRetries} attempts");
    exit(1);
}

// Ensure admin user has correct password
$adminPassword = '123456';
$hashedPassword = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 10]);

$stmt = $pdo->prepare('SELECT id, password FROM users WHERE username = ?');
$stmt->execute(['admin']);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if ($admin) {
    if (!password_verify($adminPassword, $admin['password'])) {
        $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->execute([$hashedPassword, $admin['id']]);
        $logger->info("Admin password has been reset and verified");
    } else {
        $logger->info("Admin password is already correct");
    }
} else {
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, password, nickname, role, status) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute(['admin', $hashedPassword, '系统管理员', 'admin', 1]);
    $logger->info("Admin user created successfully");
}

$logger->info("Database seed completed");
