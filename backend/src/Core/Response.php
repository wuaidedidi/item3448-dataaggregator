<?php

declare(strict_types=1);

namespace App\Core;

class Response
{
    public static function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
        header('Content-Type: application/json; charset=utf-8');
    }

    public static function json(array $data, int $httpCode = 200): void
    {
        http_response_code($httpCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, string $message = '操作成功'): void
    {
        self::json([
            'code' => 200,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function error(string $message, int $httpCode = 400): void
    {
        self::json([
            'code' => $httpCode,
            'message' => $message,
            'data' => null,
        ], $httpCode);
    }

    public static function paginated(array $items, int $total, int $page, int $pageSize): void
    {
        self::json([
            'code' => 200,
            'message' => '操作成功',
            'data' => [
                'items' => $items,
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'totalPages' => (int) ceil($total / $pageSize),
            ],
        ]);
    }
}
