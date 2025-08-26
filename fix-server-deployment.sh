#!/bin/bash

echo "=== 修复服务器部署权限问题 ==="

# 检查当前用户和目录权限
echo "当前用户: $(whoami)"
echo "当前目录: $(pwd)"
echo "目录所有者: $(stat -c '%U:%G' . 2>/dev/null || stat -f '%Su:%Sg' .)"

echo ""
echo "方案选择："
echo "1. 添加安全目录配置 (推荐)"
echo "2. 修改目录所有权"
echo "3. 切换到正确用户"

read -p "请选择修复方案 (1-3): " choice

case $choice in
    1)
        echo "=== 添加Git安全目录配置 ==="
        echo "添加当前目录为安全目录..."
        git config --global --add safe.directory "$(pwd)"
        
        echo "验证配置..."
        if git status >/dev/null 2>&1; then
            echo "✓ Git配置修复成功"
        else
            echo "✗ 仍有问题，请尝试其他方案"
        fi
        ;;
        
    2)
        echo "=== 修改目录所有权 ==="
        current_user=$(whoami)
        
        if [[ $EUID -eq 0 ]]; then
            # 如果是root用户，询问目标用户
            read -p "请输入目标用户名 (或直接回车使用root): " target_user
            target_user=${target_user:-root}
        else
            target_user=$current_user
        fi
        
        echo "将目录所有权更改为: $target_user"
        
        if [[ $EUID -eq 0 ]]; then
            chown -R $target_user:$target_user .
        else
            echo "需要sudo权限来更改所有权："
            sudo chown -R $target_user:$target_user .
        fi
        
        echo "验证修改..."
        if git status >/dev/null 2>&1; then
            echo "✓ 所有权修复成功"
        else
            echo "✗ 仍有问题，请检查权限设置"
        fi
        ;;
        
    3)
        echo "=== 用户切换指引 ==="
        echo "当前用户: $(whoami)"
        echo "目录所有者: $(stat -c '%U' . 2>/dev/null || stat -f '%Su' .)"
        echo ""
        echo "建议切换到目录所有者用户后再运行部署命令"
        echo "例如: su - [用户名]"
        echo "然后: cd $(pwd)"
        ;;
        
    *)
        echo "无效选择"
        exit 1
        ;;
esac

echo ""
echo "=== 修复完成，开始部署 ==="

# 拉取最新代码
echo "拉取最新代码..."
if git pull origin main; then
    echo "✓ 代码更新成功"
else
    echo "✗ 代码拉取失败，请手动检查"
    exit 1
fi

# 确保脚本权限
echo "设置脚本执行权限..."
chmod +x *.sh

# 检查Node.js和npm
echo "检查环境..."
if command -v node >/dev/null 2>&1; then
    echo "Node.js版本: $(node --version)"
else
    echo "⚠ Node.js未安装"
fi

if command -v npm >/dev/null 2>&1; then
    echo "npm版本: $(npm --version)"
else
    echo "⚠ npm未安装"
fi

# 安装依赖
if [[ -f package.json ]]; then
    echo "安装/更新依赖..."
    npm install
fi

# 运行快速状态检查
if [[ -f quick-status.sh ]]; then
    echo "检查服务状态..."
    ./quick-status.sh
fi

echo ""
echo "=== 部署准备完成 ==="
echo "可以运行的命令："
echo "- ./quick-status.sh     # 快速状态检查"
echo "- ./server-diagnosis.sh # 详细诊断"
echo "- ./restart-server.sh   # 重启服务"
echo ""
echo "如需启动服务，请运行："
echo "- npm start            # 直接启动"
echo "- docker-compose up -d # Docker方式启动"