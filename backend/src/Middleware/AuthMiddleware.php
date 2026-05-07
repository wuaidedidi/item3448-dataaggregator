<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Core\Logger;

class AuthMiddleware
{
    public static function authenticate(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($header) || !str_starts_with($header, 'Bearer ')) {
            Response::error('登录已过期，请重新登录', 401);
            return null;
        }

        $token = substr($header, 7);
        $payload = Auth::verifyToken($token);

        if ($payload === null) {
            Response::error('登录已过期，请重新登录', 401);
            return null;
        }

        $db = Database::getInstance();
        $user = $db->queryOne(
            'SELECT id, username, nickname, email, phone, role, status FROM users WHERE id = ? AND status = 1',
            [$payload['sub']]
        );

        if ($user === null) {
            Response::error('用户不存在或已被禁用', 401);
            return null;
        }

        Logger::getInstance()->info("Authenticated user: {$user['username']} (ID: {$user['id']})");
        return $user;
    }

    public static function requireAdmin(array $user): bool
    {
        if ($user['role'] !== 'admin') {
            Response::error('权限不足，需要管理员权限', 403);
            return false;
        }
        return true;
    }
}
