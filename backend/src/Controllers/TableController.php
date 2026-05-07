<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Logger;
use App\Core\Response;
use App\Core\Validator;

class TableController
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
        $tables = $this->db->query(
            'SELECT id, table_name, display_name, description, is_active FROM data_table_meta ORDER BY id ASC'
        );

        Response::success($tables);
    }

    public function columns(string $tableName): void
    {
        if (!$this->isTableAllowed($tableName)) {
            Response::error('数据表不存在');
            return;
        }

        $columns = $this->db->query(
            'SELECT id, table_name, column_name, display_name, data_type, is_summable, sort_order 
             FROM data_column_meta 
             WHERE table_name = ? 
             ORDER BY sort_order ASC',
            [$tableName]
        );

        Response::success($columns);
    }

    public function data(string $tableName): void
    {
        if (!$this->isTableAllowed($tableName)) {
            Response::error('数据表不存在');
            return;
        }

        $params = Validator::getQueryParams();
        $page = max(1, (int) ($params['page'] ?? 1));
        $pageSize = min(100, max(1, (int) ($params['pageSize'] ?? 20)));
        $offset = ($page - 1) * $pageSize;

        $countResult = $this->db->queryOne("SELECT COUNT(*) as total FROM `{$tableName}`");
        $total = (int) ($countResult['total'] ?? 0);

        $rows = $this->db->query(
            "SELECT * FROM `{$tableName}` ORDER BY id ASC LIMIT {$pageSize} OFFSET {$offset}"
        );

        $columnMeta = $this->db->query(
            'SELECT column_name, display_name, data_type, is_summable FROM data_column_meta WHERE table_name = ? ORDER BY sort_order ASC',
            [$tableName]
        );

        Response::success([
            'items' => $rows,
            'columns' => $columnMeta,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
            'totalPages' => (int) ceil($total / $pageSize),
        ]);
    }

    private function isTableAllowed(string $tableName): bool
    {
        $meta = $this->db->queryOne(
            'SELECT id FROM data_table_meta WHERE table_name = ?',
            [$tableName]
        );
        return $meta !== null;
    }
}
