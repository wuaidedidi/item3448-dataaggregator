<?php

declare(strict_types=1);

namespace App\Core;

use Monolog\Logger as MonologLogger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

class Logger
{
    private static ?Logger $instance = null;
    private MonologLogger $logger;

    private function __construct()
    {
        $this->logger = new MonologLogger('summary_system');

        $format = "[%datetime%] %channel%.%level_name%: %message% %context%\n";
        $formatter = new LineFormatter($format, 'Y-m-d H:i:s', true, true);

        $stdoutHandler = new StreamHandler('php://stdout', MonologLogger::DEBUG);
        $stdoutHandler->setFormatter($formatter);
        $this->logger->pushHandler($stdoutHandler);

        $stderrHandler = new StreamHandler('php://stderr', MonologLogger::ERROR);
        $stderrHandler->setFormatter($formatter);
        $this->logger->pushHandler($stderrHandler);
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function info(string $message, array $context = []): void
    {
        $this->logger->info($message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->logger->warning($message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->logger->error($message, $context);
    }

    public function debug(string $message, array $context = []): void
    {
        $this->logger->debug($message, $context);
    }
}
