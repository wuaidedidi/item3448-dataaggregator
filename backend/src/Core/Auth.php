<?php

declare(strict_types=1);

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth
{
    private static ?string $secretKey = null;

    private static function getSecretKey(): string
    {
        if (self::$secretKey === null) {
            self::$secretKey = getenv('JWT_SECRET') ?: 'summary_system_jwt_secret_key_2026';
        }
        return self::$secretKey;
    }
    private static string $algorithm = 'HS256';
    private static int $expireTime = 86400; // 24 hours

    public static function generateToken(array $userData): string
    {
        $payload = [
            'iss' => 'summary_system',
            'iat' => time(),
            'exp' => time() + self::$expireTime,
            'sub' => $userData['id'],
            'username' => $userData['username'],
            'role' => $userData['role'],
        ];

        return JWT::encode($payload, self::getSecretKey(), self::$algorithm);
    }

    public static function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key(self::getSecretKey(), self::$algorithm));
            return (array) $decoded;
        } catch (\Exception $e) {
            Logger::getInstance()->warning("JWT verification failed: {$e->getMessage()}");
            return null;
        }
    }

    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    public static function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }
}
