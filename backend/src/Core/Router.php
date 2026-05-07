<?php

declare(strict_types=1);

namespace App\Core;

use App\Middleware\AuthMiddleware;

class Router
{
    private array $routes = [];

    public function addRoute(string $method, string $pattern, $handler, bool $requireAuth = false): void
    {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
            'requireAuth' => $requireAuth,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $regex = $this->patternToRegex($route['pattern']);
            if (preg_match($regex, $uri, $matches)) {
                array_shift($matches);
                $params = array_values(array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));

                if ($route['requireAuth']) {
                    $user = AuthMiddleware::authenticate();
                    if ($user === null) {
                        return;
                    }
                    $_REQUEST['auth_user'] = $user;
                }

                $this->callHandler($route['handler'], $params);
                return;
            }
        }

        Response::error('接口不存在', 404);
    }

    private function patternToRegex(string $pattern): string
    {
        if ($pattern[0] === '/' && substr($pattern, -1) === '/' && strlen($pattern) > 2) {
            $inner = substr($pattern, 1, -1);
            if (strpos($inner, '{') === false) {
                return '#^' . $inner . '$#';
            }
        }

        $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        return '#^' . $regex . '$#';
    }

    private function callHandler($handler, array $params): void
    {
        if (is_callable($handler) && !is_array($handler)) {
            call_user_func_array($handler, $params);
            return;
        }

        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            $instance = new $class();
            call_user_func_array([$instance, $method], $params);
            return;
        }

        Response::error('路由处理器配置错误', 500);
    }
}
