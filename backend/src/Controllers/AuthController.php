<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Logger;
use App\Core\Response;
use App\Core\Validator;

class AuthController
{
    private Database $db;
    private Logger $logger;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->logger = Logger::getInstance();
    }

    public function login(): void
    {
        $body = Validator::getJsonBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        $validator = new Validator();
        $validator->required('username', $username, '用户名')
                  ->required('password', $password, '密码');

        if (!$validator->isValid()) {
            Response::error($validator->firstError());
            return;
        }

        $user = $this->db->queryOne(
            'SELECT id, username, password, nickname, email, phone, role, status FROM users WHERE username = ?',
            [$username]
        );

        if ($user === null) {
            Response::error('用户名或密码错误');
            return;
        }

        if ((int) $user['status'] !== 1) {
            Response::error('账号已被禁用，请联系管理员');
            return;
        }

        if (!Auth::verifyPassword($password, $user['password'])) {
            Response::error('用户名或密码错误');
            return;
        }

        $token = Auth::generateToken($user);
        unset($user['password']);

        $this->logger->info("User logged in: {$user['username']}");

        Response::success([
            'token' => $token,
            'user' => $user,
        ], '登录成功');
    }

    public function register(): void
    {
        $body = Validator::getJsonBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';
        $nickname = trim($body['nickname'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');

        $validator = new Validator();
        $validator->required('username', $username, '用户名')
                  ->minLength('username', $username, 3, '用户名')
                  ->maxLength('username', $username, 20, '用户名')
                  ->required('password', $password, '密码')
                  ->minLength('password', $password, 6, '密码')
                  ->email('email', $email, '邮箱')
                  ->phone('phone', $phone, '手机号');

        if (!$validator->isValid()) {
            Response::error($validator->firstError());
            return;
        }

        $existing = $this->db->queryOne(
            'SELECT id FROM users WHERE username = ?',
            [$username]
        );

        if ($existing !== null) {
            Response::error('用户名已存在');
            return;
        }

        $hashedPassword = Auth::hashPassword($password);

        $this->db->execute(
            'INSERT INTO users (username, password, nickname, email, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$username, $hashedPassword, $nickname ?: $username, $email, $phone, 'user', 1]
        );

        $this->logger->info("New user registered: {$username}");
        Response::success(null, '注册成功');
    }

    public function profile(): void
    {
        $user = $_REQUEST['auth_user'];
        Response::success($user);
    }

    public function updateProfile(): void
    {
        $user = $_REQUEST['auth_user'];
        $body = Validator::getJsonBody();

        $nickname = trim($body['nickname'] ?? $user['nickname']);
        $email = trim($body['email'] ?? $user['email']);
        $phone = trim($body['phone'] ?? $user['phone']);

        $validator = new Validator();
        $validator->maxLength('nickname', $nickname, 50, '昵称')
                  ->email('email', $email, '邮箱')
                  ->phone('phone', $phone, '手机号');

        if (!$validator->isValid()) {
            Response::error($validator->firstError());
            return;
        }

        $this->db->execute(
            'UPDATE users SET nickname = ?, email = ?, phone = ? WHERE id = ?',
            [$nickname, $email, $phone, $user['id']]
        );

        $updatedUser = $this->db->queryOne(
            'SELECT id, username, nickname, email, phone, role, status FROM users WHERE id = ?',
            [$user['id']]
        );

        $this->logger->info("User profile updated: {$user['username']}");
        Response::success($updatedUser, '个人信息更新成功');
    }

    public function changePassword(): void
    {
        $user = $_REQUEST['auth_user'];
        $body = Validator::getJsonBody();

        $oldPassword = $body['oldPassword'] ?? '';
        $newPassword = $body['newPassword'] ?? '';

        $validator = new Validator();
        $validator->required('oldPassword', $oldPassword, '原密码')
                  ->required('newPassword', $newPassword, '新密码')
                  ->minLength('newPassword', $newPassword, 6, '新密码');

        if (!$validator->isValid()) {
            Response::error($validator->firstError());
            return;
        }

        $fullUser = $this->db->queryOne(
            'SELECT id, password FROM users WHERE id = ?',
            [$user['id']]
        );

        if (!Auth::verifyPassword($oldPassword, $fullUser['password'])) {
            Response::error('原密码不正确');
            return;
        }

        $hashedPassword = Auth::hashPassword($newPassword);
        $this->db->execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [$hashedPassword, $user['id']]
        );

        $this->logger->info("User changed password: {$user['username']}");
        Response::success(null, '密码修改成功');
    }
}
