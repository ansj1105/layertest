# Node.js 22 버전의 경량 Alpine 이미지를 기반으로 설정
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 전체 소스 코드 복사
COPY . .

# 포트 5173을 외부에 노출
EXPOSE 5173

# Vite 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
