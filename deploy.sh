#!/bin/bash

# 도메인 기반 배포 스크립트

echo "🚀 도메인 기반 배포 시작..."

# 1. 클라이언트 빌드
echo "📦 클라이언트 빌드 중..."
cd client
npm run build
cd ..

# 2. nginx 설정 파일 복사
echo "⚙️ nginx 설정 적용 중..."
sudo cp nginx.conf.example /etc/nginx/sites-available/yourdomain.com

# 도메인 이름 변경 (실제 도메인으로)
sudo sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN.com/g' /etc/nginx/sites-available/yourdomain.com

# 심볼릭 링크 생성
sudo ln -sf /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# 3. 클라이언트 파일 복사
echo "📁 클라이언트 파일 복사 중..."
sudo mkdir -p /var/www/html/client/dist
sudo cp -r client/dist/* /var/www/html/client/dist/

# 4. nginx 설정 테스트 및 재시작
echo "🔄 nginx 재시작 중..."
sudo nginx -t
sudo systemctl restart nginx

# 5. Node.js 서버 재시작
echo "🔄 Node.js 서버 재시작 중..."
pm2 restart all

echo "✅ 배포 완료!"
echo "🌐 https://yourdomain.com 에서 확인하세요" 