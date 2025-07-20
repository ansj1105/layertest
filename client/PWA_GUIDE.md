# Progressive Web App (PWA) 적용 가이드

## 개요
이 프로젝트는 Vite + React를 기반으로 한 PWA(Progressive Web App)입니다. 사용자는 웹 앱을 네이티브 앱처럼 홈 화면에 설치하고 사용할 수 있습니다.

## 주요 기능

### 1. PWA 설치 프롬프트
- 사용자가 앱을 설치할 수 있도록 브라우저에서 자동으로 설치 프롬프트를 표시
- 설치 버튼과 "나중에" 버튼을 제공하여 사용자 선택권 보장

### 2. 오프라인 지원
- Service Worker를 통한 캐싱으로 오프라인에서도 기본 기능 사용 가능
- API 요청에 대한 NetworkFirst 전략 적용

### 3. 앱 아이콘 및 스플래시 화면
- 다양한 크기의 앱 아이콘 제공 (16x16 ~ 512x512)
- 홈 화면에 추가 시 네이티브 앱과 유사한 경험 제공

## 설치된 파일들

### 1. 매니페스트 파일
- `public/manifest.json`: PWA 설정 정보
- `dist/manifest.webmanifest`: 빌드된 매니페스트 파일

### 2. 서비스 워커
- `dist/sw.js`: 자동 생성된 서비스 워커
- `dist/workbox-*.js`: Workbox 라이브러리

### 3. 아이콘 파일들
- `public/icons/`: 다양한 크기의 PWA 아이콘들

## 설정 옵션

### Vite 설정 (vite.config.js)
```javascript
VitePWA({
  registerType: 'autoUpdate', // 자동 업데이트
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    // PWA 매니페스트 설정
  },
  workbox: {
    // 캐싱 전략 설정
  }
})
```

### 매니페스트 설정
- `name`: 앱 이름
- `short_name`: 짧은 앱 이름
- `description`: 앱 설명
- `theme_color`: 테마 색상
- `background_color`: 배경 색상
- `display`: 표시 모드 (standalone)
- `start_url`: 시작 URL
- `icons`: 앱 아이콘 목록

## 사용법

### 1. 개발 환경에서 테스트
```bash
npm run dev
```

### 2. 프로덕션 빌드
```bash
npm run build
```

### 3. PWA 설치 테스트
1. 브라우저에서 앱 접속
2. 주소창 옆의 설치 아이콘 클릭
3. 또는 앱에서 자동으로 표시되는 설치 프롬프트 사용

## 브라우저 지원

### 지원되는 브라우저
- Chrome (Android, Desktop)
- Edge (Windows)
- Safari (iOS, macOS)
- Firefox (모든 플랫폼)

### PWA 설치 조건
- HTTPS 환경 (localhost 제외)
- 유효한 매니페스트 파일
- 등록된 서비스 워커
- 사용자가 사이트를 방문한 기록

## 커스터마이징

### 1. 아이콘 변경
- `public/icons/` 폴더의 아이콘 파일들을 원하는 이미지로 교체
- 매니페스트 파일에서 아이콘 경로 업데이트

### 2. 테마 색상 변경
- `manifest.json`의 `theme_color`와 `background_color` 수정
- HTML의 `meta` 태그도 함께 업데이트

### 3. 캐싱 전략 수정
- `vite.config.js`의 `workbox` 설정에서 캐싱 규칙 변경

## 문제 해결

### 1. PWA 설치 프롬프트가 나타나지 않는 경우
- HTTPS 환경인지 확인
- 브라우저 개발자 도구에서 PWA 탭 확인
- 매니페스트 파일이 올바른지 확인

### 2. 오프라인 기능이 작동하지 않는 경우
- 서비스 워커가 등록되었는지 확인
- 캐싱된 리소스 확인

### 3. 아이콘이 표시되지 않는 경우
- 아이콘 파일 경로 확인
- 아이콘 파일 형식 확인 (PNG 권장)

## 추가 개선 사항

### 1. 오프라인 페이지 추가
- 네트워크 연결이 없을 때 표시할 페이지 생성

### 2. 푸시 알림 구현
- 사용자에게 푸시 알림을 보낼 수 있는 기능 추가

### 3. 백그라운드 동기화
- 네트워크 연결 복구 시 데이터 동기화 기능

## 참고 자료
- [PWA 공식 문서](https://web.dev/progressive-web-apps/)
- [Vite PWA 플러그인](https://vite-pwa.dev/)
- [Workbox 문서](https://developers.google.com/web/tools/workbox) 