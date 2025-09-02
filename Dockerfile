# ʹ��Node.js�ٷ�������Ϊ��������
FROM node:16-alpine

# ���ù���Ŀ¼
WORKDIR /app

# ����package.json��package-lock.json
COPY package*.json ./

# ��װ��Ŀ����
RUN npm install

# ��������Դ����
COPY . .

# ���ö˿ڻ�������
ENV PORT=8080

# ��¶�˿�
EXPOSE 8080

# ����Ӧ��
CMD ["npm", "start"]
