<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Logger;
use App\Core\Response;
use App\Core\Validator;

class SummaryController
{
    private Database $db;
    private Logger $logger;

    private array $operatorMap = [
        'equals' => '=',
        'not_equals' => '!=',
        'greater_than' => '>',
        'less_than' => '<',
        'greater_equal' => '>=',
        'less_equal' => '<=',
        'contains' => 'LIKE',
        'not_contains' => 'NOT LIKE',
    ];

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->logger = Logger::getInstance();
    }

    public function generate(): void
    {
        $body = Validator::getJsonBody();
        $items = $body['items'] ?? [];

        if (empty($items) || !is_array($items)) {
            Response::error('请至少添加一个汇总项');
            return;
        }

        if (count($items) > 50) {
            Response::error('汇总项数量不能超过50个');
            return;
        }

        $results = [];

        foreach ($items as $index => $item) {
            $result = $this->processItem($item, $index);
            if ($result === null) {
                return;
            }
            $results[] = $result;
        }

        $this->logger->info("Summary generated successfully", ['itemCount' => count($results)]);

        Response::success([
            'results' => $results,
            'generatedAt' => date('Y-m-d H:i:s'),
            'totalItems' => count($results),
        ], '汇总表生成成功');
    }

    private function processItem(array $item, int $index): ?array
    {
        $name = trim($item['name'] ?? '');
        $tables = $item['tables'] ?? [];
        $summaryColumn = $item['summaryColumn'] ?? '';
        $conditions = $item['conditions'] ?? [];

        if (empty($name)) {
            Response::error("第" . ($index + 1) . "个汇总项名称不能为空");
            return null;
        }

        if (empty($tables) || !is_array($tables)) {
            Response::error("汇总项「{$name}」未选择数据表");
            return null;
        }

        if (empty($summaryColumn)) {
            Response::error("汇总项「{$name}」未选择汇总列");
            return null;
        }

        $validTables = $this->getValidTables();
        $validColumns = $this->getValidColumns();

        foreach ($tables as $tableName) {
            if (!isset($validTables[$tableName])) {
                Response::error("汇总项「{$name}」中的数据表「{$tableName}」不存在");
                return null;
            }
        }

        $totalValue = 0;
        $details = [];

        foreach ($tables as $tableName) {
            $tableResult = $this->queryTable($tableName, $summaryColumn, $conditions, $validColumns);
            if ($tableResult === null) {
                Response::error("汇总项「{$name}」查询失败，请检查配置");
                return null;
            }

            $details[] = [
                'table' => $validTables[$tableName],
                'tableName' => $tableName,
                'value' => (float) $tableResult['sum_value'],
                'rowCount' => (int) $tableResult['row_count'],
            ];

            $totalValue += (float) $tableResult['sum_value'];
        }

        $columnDisplayName = $this->getColumnDisplayName($summaryColumn, $tables[0] ?? '');

        return [
            'name' => $name,
            'tables' => implode(', ', array_map(fn($t) => $validTables[$t] ?? $t, $tables)),
            'summaryColumn' => $columnDisplayName,
            'summaryColumnKey' => $summaryColumn,
            'value' => round($totalValue, 2),
            'details' => $details,
            'conditionCount' => count($conditions),
        ];
    }

    private function queryTable(string $tableName, string $column, array $conditions, array $validColumns): ?array
    {
        $allowedColumns = [];
        foreach ($validColumns as $vc) {
            if ($vc['table_name'] === $tableName) {
                $allowedColumns[] = $vc['column_name'];
            }
        }

        if (!in_array($column, $allowedColumns)) {
            $this->logger->warning("Column not found in table", [
                'table' => $tableName,
                'column' => $column,
            ]);
            return ['sum_value' => 0, 'row_count' => 0];
        }

        $whereClause = '';
        $params = [];

        if (!empty($conditions)) {
            $whereParts = [];
            foreach ($conditions as $cond) {
                $condColumn = $cond['column'] ?? '';
                $operator = $cond['operator'] ?? '';
                $value = $cond['value'] ?? '';
                $logic = strtoupper($cond['logic'] ?? 'AND');

                if (empty($condColumn) || empty($operator)) {
                    continue;
                }

                if (!in_array($condColumn, $allowedColumns)) {
                    continue;
                }

                if (!isset($this->operatorMap[$operator])) {
                    continue;
                }

                $sqlOp = $this->operatorMap[$operator];

                if ($operator === 'contains') {
                    $whereParts[] = [
                        'logic' => $logic,
                        'clause' => "`{$condColumn}` {$sqlOp} ?",
                        'value' => "%{$value}%",
                    ];
                } elseif ($operator === 'not_contains') {
                    $whereParts[] = [
                        'logic' => $logic,
                        'clause' => "`{$condColumn}` {$sqlOp} ?",
                        'value' => "%{$value}%",
                    ];
                } else {
                    $whereParts[] = [
                        'logic' => $logic,
                        'clause' => "`{$condColumn}` {$sqlOp} ?",
                        'value' => $value,
                    ];
                }
            }

            if (!empty($whereParts)) {
                $whereStr = '';
                foreach ($whereParts as $i => $part) {
                    if ($i === 0) {
                        $whereStr = $part['clause'];
                    } else {
                        $logicOp = in_array($part['logic'], ['AND', 'OR']) ? $part['logic'] : 'AND';
                        $whereStr .= " {$logicOp} " . $part['clause'];
                    }
                    $params[] = $part['value'];
                }
                $whereClause = "WHERE {$whereStr}";
            }
        }

        $sql = "SELECT COALESCE(SUM(`{$column}`), 0) as sum_value, COUNT(*) as row_count FROM `{$tableName}` {$whereClause}";

        $this->logger->debug("Summary query", ['sql' => $sql, 'params' => $params]);

        try {
            $result = $this->db->queryOne($sql, $params);
            return $result;
        } catch (\Throwable $e) {
            $this->logger->error("Summary query failed: {$e->getMessage()}", [
                'table' => $tableName,
                'column' => $column,
            ]);
            return null;
        }
    }

    private function getValidTables(): array
    {
        $tables = $this->db->query('SELECT table_name, display_name FROM data_table_meta WHERE is_active = 1');
        $map = [];
        foreach ($tables as $t) {
            $map[$t['table_name']] = $t['display_name'];
        }
        return $map;
    }

    private function getValidColumns(): array
    {
        return $this->db->query('SELECT table_name, column_name, display_name, data_type, is_summable FROM data_column_meta');
    }

    private function getColumnDisplayName(string $columnName, string $tableName): string
    {
        $meta = $this->db->queryOne(
            'SELECT display_name FROM data_column_meta WHERE column_name = ? AND table_name = ?',
            [$columnName, $tableName]
        );
        return $meta['display_name'] ?? $columnName;
    }
}
