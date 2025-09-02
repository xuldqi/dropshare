# 使用Node.js官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制所有源代码
COPY . .

# 设置端口环境变量
ENV PORT=8080

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]
