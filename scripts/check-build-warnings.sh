#!/bin/bash
# 快速檢查指定版本的建置警告數量

COMMIT=$1
if [ -z "$COMMIT" ]; then
    echo "使用方式: $0 <commit-hash>"
    exit 1
fi

echo "檢查提交: $COMMIT"
echo "----------------------------------------"

# 暫存當前變更
git stash push -m "檢查警告前的暫存" > /dev/null 2>&1

# 切換到指定提交
git checkout "$COMMIT" > /dev/null 2>&1

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "安裝依賴中..."
    npm ci > /dev/null 2>&1
fi

# 執行建置並統計警告
echo "執行建置中..."
WARNINGS=$(npm run build 2>&1 | grep -c "Warning:" || echo "0")
ERRORS=$(npm run build 2>&1 | grep -c "Error:" || echo "0")
BUILD_STATUS=$?

echo "警告數量: $WARNINGS"
echo "錯誤數量: $ERRORS"
echo "建置狀態: $([ $BUILD_STATUS -eq 0 ] && echo '成功' || echo '失敗')"

# 返回原分支
git checkout main > /dev/null 2>&1

# 恢復暫存的變更
git stash pop > /dev/null 2>&1

exit 0
