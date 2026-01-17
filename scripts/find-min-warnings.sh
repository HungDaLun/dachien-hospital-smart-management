#!/bin/bash
# 快速檢查多個版本的警告數量，找出警告最少的版本

echo "開始檢查各個版本的建置警告數量..."
echo "========================================="
echo ""

# 要檢查的版本列表（從新到舊）
COMMITS=(
    "d72b0ac"  # 當前版本
    "3033669"  # fix-build-warnings 分支
    "f3a48e8"  # 從備份分支取回重要的 MD 文件
    "9a358fa"  # 系統持續優化
    "b7e107b"  # 正式完成版1.0
    "0c254b0"  # 初次提交
)

CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)

# 暫存當前變更
git stash push -m "檢查警告前的暫存-$(date +%s)" > /dev/null 2>&1

RESULTS=()

for commit in "${COMMITS[@]}"; do
    echo -n "檢查 $commit ... "
    
    # 檢查提交是否存在
    if ! git cat-file -e "$commit^{commit}" 2>/dev/null; then
        echo "跳過（提交不存在）"
        continue
    fi
    
    # 切換到指定提交
    git checkout "$commit" > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo "失敗（無法切換）"
        continue
    fi
    
    # 檢查是否有 package.json
    if [ ! -f "package.json" ]; then
        echo "跳過（非專案目錄）"
        git checkout "$CURRENT_BRANCH" > /dev/null 2>&1
        continue
    fi
    
    # 獲取提交訊息
    COMMIT_MSG=$(git log -1 --pretty=format:"%s" "$commit" 2>/dev/null | cut -c1-50)
    
    # 檢查 node_modules
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ] 2>/dev/null; then
        echo -n "（安裝依賴中...）"
        npm ci --silent > /dev/null 2>&1
    fi
    
    # 執行建置並統計警告（只運行一次建置）
    BUILD_OUTPUT=$(npm run build 2>&1)
    WARNINGS=$(echo "$BUILD_OUTPUT" | grep -c "Warning:" || echo "0")
    ERRORS=$(echo "$BUILD_OUTPUT" | grep -c "Error:" || echo "0")
    BUILD_STATUS=$?
    
    if [ $BUILD_STATUS -eq 0 ]; then
        echo "警告: $WARNINGS, 錯誤: $ERRORS"
        RESULTS+=("$commit|$WARNINGS|$ERRORS|$COMMIT_MSG")
    else
        echo "建置失敗"
        RESULTS+=("$commit|FAILED|FAILED|$COMMIT_MSG")
    fi
done

# 返回原分支
git checkout "$CURRENT_BRANCH" > /dev/null 2>&1

# 恢復暫存的變更
git stash pop > /dev/null 2>&1

echo ""
echo "========================================="
echo "檢查結果："
echo ""
printf "%-10s %-8s %-8s %s\n" "提交" "警告" "錯誤" "訊息"
echo "----------------------------------------"

# 排序結果（按警告數）
IFS=$'\n' SORTED_RESULTS=($(printf '%s\n' "${RESULTS[@]}" | sort -t'|' -k2 -n))

for result in "${SORTED_RESULTS[@]}"; do
    IFS='|' read -r commit warnings errors msg <<< "$result"
    printf "%-10s %-8s %-8s %s\n" "${commit:0:8}" "$warnings" "$errors" "$msg"
done

# 找出警告最少的版本
if [ ${#SORTED_RESULTS[@]} -gt 0 ]; then
    BEST=$(echo "${SORTED_RESULTS[0]}" | cut -d'|' -f1)
    BEST_WARNINGS=$(echo "${SORTED_RESULTS[0]}" | cut -d'|' -f2)
    echo ""
    echo "⚠️  警告最少的版本：$BEST (警告數: $BEST_WARNINGS)"
fi
