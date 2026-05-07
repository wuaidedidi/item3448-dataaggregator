<?php

declare(strict_types=1);

namespace App\Core;

use App\Controllers\AuthController;
use App\Controllers\TableController;
use App\Controllers\SummaryController;
use App\Controllers\UserController;

class App
{
    private Router $router;
    private Logger $logger;

    public function __construct()
    {
        $this->logger = Logger::getInstance();
        $this->router = new Router();
        $this->registerRoutes();
    }

    private function registerRoutes(): void
    {
        // CORS preflight
        $this->router->addRoute('OPTIONS', '/.*/', function () {
            Response::cors();
            Response::json(['code' => 200, 'message' => 'ok', 'data' => null]);
        });

        // Auth routes (public)
        $this->router->addRoute('POST', '/api/auth/login', [AuthController::class, 'login']);
        $this->router->addRoute('POST', '/api/auth/register', [AuthController::class, 'register']);

        // Auth routes (protected)
        $this->router->addRoute('GET', '/api/auth/profile', [AuthController::class, 'profile'], true);
        $this->router->addRoute('PUT', '/api/auth/profile', [AuthController::class, 'updateProfile'], true);
        $this->router->addRoute('PUT', '/api/auth/password', [AuthController::class, 'changePassword'], true);

        // Table routes (protected)
        $this->router->addRoute('GET', '/api/tables', [TableController::class, 'list'], true);
        $this->router->addRoute('GET', '/api/tables/{tableName}/columns', [TableController::class, 'columns'], true);
        $this->router->addRoute('GET', '/api/tables/{tableName}/data', [TableController::class, 'data'], true);

        // Summary routes (protected)
        $this->router->addRoute('POST', '/api/summary/generate', [SummaryController::class, 'generate'], true);

        // User management routes (protected, admin only)
        $this->router->addRoute('GET', '/api/users', [UserController::class, 'list'], true);
        $this->router->addRoute('PUT', '/api/users/{id}', [UserController::class, 'update'], true);
        $this->router->addRoute('DELETE', '/api/users/{id}', [UserController::class, 'delete'], true);
    }

    public function run(): void
    {
        Response::cors();

        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $this->logger->info("Request: {$method} {$uri}");

        try {
            $this->router->dispatch($method, $uri);
        } catch (\Throwable $e) {
            $this->logger->error("Unhandled exception: {$e->getMessage()}", [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            Response::error('服务器内部错误，请稍后重试', 500);
        }
    }
}
