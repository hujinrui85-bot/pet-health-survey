#!/bin/bash
# ==============================================
# 宠物健康问卷 - 一键部署脚本
# 适用于: Ubuntu 20.04+ / CentOS 7+
# 用法: chmod +x deploy.sh && sudo ./deploy.sh
# ==============================================
set -e

APP_DIR="/opt/pet-survey"
NODE_VERSION="22"

echo "=========================================="
echo "  宠物健康问卷 - 服务器部署"
echo "=========================================="

# 1. 安装 Node.js
if ! command -v node &> /dev/null; then
    echo "[1/5] 安装 Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
else
    echo "[1/5] Node.js 已安装: $(node -v)"
fi

# 2. 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "[2/5] 安装 PM2..."
    npm install -g pm2
else
    echo "[2/5] PM2 已安装: $(pm2 -v)"
fi

# 3. 创建应用目录并复制文件
echo "[3/5] 部署应用文件到 ${APP_DIR}..."
mkdir -p ${APP_DIR}
cp server.js ${APP_DIR}/
cp cat-nutrition-assistant.html ${APP_DIR}/
cp admin.html ${APP_DIR}/
cp records.json ${APP_DIR}/ 2>/dev/null || echo "[]" > ${APP_DIR}/records.json

# 4. 安装 Nginx（可选，直接 Node 也可以）
if ! command -v nginx &> /dev/null; then
    echo "[4/5] 安装 Nginx..."
    apt-get install -y nginx
    cp nginx.conf /etc/nginx/conf.d/pet-survey.conf
    echo "  请编辑 /etc/nginx/conf.d/pet-survey.conf 替换域名"
    echo "  然后执行: nginx -t && systemctl reload nginx"
else
    echo "[4/5] Nginx 已安装"
fi

# 5. 启动应用
echo "[5/5] 启动应用..."
cd ${APP_DIR}
pm2 delete pet-health-survey 2>/dev/null || true
pm2 start server.js --name pet-health-survey
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "  HTTP 访问: http://你的服务器IP:3000"
echo "  问卷页面:  http://你的服务器IP:3000/cat-nutrition-assistant.html"
echo "  管理后台:  http://你的服务器IP:3000/admin"
echo ""
echo "  下一步："
echo "  1. 配置域名 DNS 解析到服务器 IP"
echo "  2. 编辑 /etc/nginx/conf.d/pet-survey.conf 替换域名"
echo "  3. 执行: certbot --nginx -d 你的域名.com  来启用 HTTPS"
echo "  4. 防火墙开放端口: ufw allow 80 && ufw allow 443"
echo ""
