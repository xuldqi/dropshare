#!/bin/bash

# 设置 crontab 自动续期
# 每天凌晨 2 点检查并续期证书

CRON_JOB="0 2 * * * cd /Users/macmima1234/Documents/project/dropshare && ./ssl-renew.sh >> /tmp/ssl-renew.log 2>&1"

# 添加 crontab 任务
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "已设置 crontab 自动续期任务："
echo "每天凌晨 2 点自动续期 SSL 证书"
echo ""
echo "查看当前 crontab："
crontab -l
