<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Logger;
use App\Core\Response;
use App\Core\Validator;
use App\Middleware\AuthMiddleware;

class UserController
{
    private Database $db;
    private Logger $logger;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->logger = Logger::getInstance();
    }

    public function list(): void
    {
        $currentUser = $_REQUEST['auth_user'];
        if (!AuthMiddleware::requireAdmin($currentUser)) {
            return;
        }

        $params = Validator::getQueryParams();
        $page = max(1, (int) ($params['page'] ?? 1));
        $pageSize = min(100, max(1, (int) ($params['pageSize'] ?? 20)));
        $offset = ($page - 1) * $pageSize;

        $countResult = $this->db->queryOne('SELECT COUNT(*) as total FROM users');
        $total = (int) ($countResult['total'] ?? 0);

        $users = $this->db->query(
            'SELECT id, username, nickname, email, phone, role, status, created_at, updated_at 
             FROM users ORDER BY id ASC LIMIT ? OFFSET ?',
            [$pageSize, $offset]
        );

        Response::paginated($users, $total, $page, $pageSize);
    }

    public function update(string $id): void
    {
        $currentUser = $_REQUEST['auth_user'];
        if (!AuthMiddleware::requireAdmin($currentUser)) {
            return;
        }

        $userId = (int) $id;
        $body = Validator::getJsonBody();

        $targetUser = $this->db->queryOne(
            'SELECT id, username, role FROM users WHERE id = ?',
            [$userId]
        );

        if ($targetUser === null) {
            Response::error('用户不存在');
            return;
        }

        // 管理员不能修改自己的角色和状态
        if ((int) $currentUser['id'] === $userId) {
            if (isset($body['role']) && $body['role'] !== $currentUser['role']) {
                Response::error('管理员不能修改自己的角色');
                return;
            }
            if (isset($body['status']) && (int) $body['status'] !== 1) {
                Response::error('管理员不能禁用自己的账号');
                return;
            }
        }

        $nickname = trim($body['nickname'] ?? $targetUser['username']);
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $role = $body['role'] ?? $targetUser['role'];
        $status = isset($body['status']) ? (int) $body['status'] : 1;

        $validator = new Validator();
        $validator->maxLength('nickname', $nickname, 50, '昵称')
                  ->email('email', $email, '邮箱')
                  ->phone('phone', $phone, '手机号')
                  ->inArray('role', $role, ['admin', 'user'], '角色');

        if (!$validator->isValid()) {
            Response::error($validator->firstError());
            return;
        }

        $this->db->execute(
            'UPDATE users SET nickname = ?, email = ?, phone = ?, role = ?, status = ? WHERE id = ?',
            [$nickname, $email, $phone, $role, $status, $userId]
        );

        $this->logger->info("User updated by admin", [
            'admin' => $currentUser['username'],
            'target_user_id' => $userId,
        ]);

        Response::success(null, '用户信息更新成功');
    }

    public function delete(string $id): void
    {
        $currentUser = $_REQUEST['auth_user'];
        if (!AuthMiddleware::requireAdmin($currentUser)) {
            return;
        }

        $userId = (int) $id;

        if ((int) $currentUser['id'] === $userId) {
            Response::error('不能删除自己的账号');
            return;
        }

        $targetUser = $this->db->queryOne(
            'SELECT id, username FROM users WHERE id = ?',
            [$userId]
        );

        if ($targetUser === null) {
            Response::error('用户不存在');
            return;
        }

        $this->db->execute('DELETE FROM users WHERE id = ?', [$userId]);

        $this->logger->info("User deleted by admin", [
            'admin' => $currentUser['username'],
            'deleted_user' => $targetUser['username'],
        ]);

        Response::success(null, '用户删除成功');
    }
}
