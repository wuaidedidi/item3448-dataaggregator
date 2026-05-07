<?php

declare(strict_types=1);

namespace App\Core;

class Validator
{
    private array $errors = [];

    public function required(string $field, $value, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value === null || $value === '') {
            $this->errors[] = "{$displayName}不能为空";
        }
        return $this;
    }

    public function minLength(string $field, $value, int $min, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value !== null && $value !== '' && mb_strlen((string) $value) < $min) {
            $this->errors[] = "{$displayName}长度不能少于{$min}个字符";
        }
        return $this;
    }

    public function maxLength(string $field, $value, int $max, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value !== null && $value !== '' && mb_strlen((string) $value) > $max) {
            $this->errors[] = "{$displayName}长度不能超过{$max}个字符";
        }
        return $this;
    }

    public function email(string $field, $value, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = "{$displayName}格式不正确";
        }
        return $this;
    }

    public function phone(string $field, $value, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value !== null && $value !== '' && !preg_match('/^1[3-9]\d{9}$/', (string) $value)) {
            $this->errors[] = "{$displayName}格式不正确";
        }
        return $this;
    }

    public function inArray(string $field, $value, array $allowed, string $label = ''): self
    {
        $displayName = $label ?: $field;
        if ($value !== null && $value !== '' && !in_array($value, $allowed, true)) {
            $this->errors[] = "{$displayName}的值不合法";
        }
        return $this;
    }

    public function isValid(): bool
    {
        return empty($this->errors);
    }

    public function firstError(): string
    {
        return $this->errors[0] ?? '';
    }

    public function allErrors(): array
    {
        return $this->errors;
    }

    public static function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function getQueryParams(): array
    {
        return $_GET;
    }
}
