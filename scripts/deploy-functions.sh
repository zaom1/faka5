#!/usr/bin/env bash
# 批量部署 Supabase Edge Functions 脚本
# 遍历 supabase/functions/ 目录，自动部署所有函数
# 使用方法: bash scripts/deploy-functions.sh

set -e

FUNCTIONS_DIR="supabase/functions"

if [ ! -d "$FUNCTIONS_DIR" ]; then
  echo "错误: 未找到 $FUNCTIONS_DIR 目录"
  exit 1
fi

echo "开始部署 Edge Functions..."
echo "========================================"

# 统计部署结果
SUCCESS_COUNT=0
FAIL_COUNT=0

# 遍历 functions 目录下的所有子目录（排除 shared 和根目录文件）
for dir in "$FUNCTIONS_DIR"/*/; do
  # 跳过 shared 模块目录
  if [ "$(basename "$dir")" = "shared" ]; then
    continue
  fi

  # 检查是否存在 index.ts 入口文件
  if [ ! -f "$dir/index.ts" ]; then
    echo "跳过 $(basename "$dir"): 未找到 index.ts"
    continue
  fi

  FUNC_NAME=$(basename "$dir")
  echo "正在部署: $FUNC_NAME"

  # 部署函数，使用 --no-verify-jwt 标志
  if supabase functions deploy "$FUNC_NAME" --no-verify-jwt 2>/dev/null; then
    echo "  ✅ $FUNC_NAME 部署成功"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "  ❌ $FUNC_NAME 部署失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo "========================================"
echo "部署完成: 成功 $SUCCESS_COUNT 个, 失败 $FAIL_COUNT 个"

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
