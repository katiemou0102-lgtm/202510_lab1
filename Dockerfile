# 使用輕量級的 Nginx Alpine 映像
FROM nginx:alpine

# 映像資訊
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/YOUR_REPO"
LABEL org.opencontainers.image.description="井字遊戲 - 靜態網頁應用"
LABEL org.opencontainers.image.licenses="MIT"

# 移除預設靜態頁
RUN rm -rf /usr/share/nginx/html/*

# 複製靜態檔案
COPY app/ /usr/share/nginx/html/

# 複製自訂 Nginx 設定（請確認裡面是 listen 8080）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 修正非 root 執行所需的目錄權限
RUN mkdir -p /tmp/nginx \
    && chown -R nginx:nginx \
        /usr/share/nginx \
        /var/cache/nginx \
        /etc/nginx \
        /tmp

# 切換為非 root 使用者
USER nginx

# 使用非特權 port
EXPOSE 8080

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
