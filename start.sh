#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PM2 앱 이름
SERVER_APP="vietcoin-server"
CLIENT_APP="vietcoin-client"

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# PM2 설치 확인
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2가 설치되지 않았습니다."
        log_info "PM2를 설치하려면: npm install -g pm2"
        exit 1
    fi
}

# 서버 시작
start_server() {
    log_info "서버 시작 중..."
    cd "$PROJECT_ROOT"
    
    if pm2 list | grep -q "$SERVER_APP"; then
        log_warning "서버가 이미 실행 중입니다. 재시작합니다."
        pm2 restart "$SERVER_APP"
    else
        pm2 start server.js --name "$SERVER_APP" --watch
    fi
    
    log_success "서버가 시작되었습니다."
}

# 클라이언트 시작
start_client() {
    log_info "클라이언트 시작 중..."
    cd "$PROJECT_ROOT/client"
    
    if pm2 list | grep -q "$CLIENT_APP"; then
        log_warning "클라이언트가 이미 실행 중입니다. 재시작합니다."
        pm2 restart "$CLIENT_APP"
    else
        pm2 start "npm run dev" --name "$CLIENT_APP" --watch
    fi
    
    log_success "클라이언트가 시작되었습니다."
}

# 서버 중지
stop_server() {
    log_info "서버 중지 중..."
    pm2 stop "$SERVER_APP" 2>/dev/null || log_warning "서버가 실행 중이 아닙니다."
    log_success "서버가 중지되었습니다."
}

# 클라이언트 중지
stop_client() {
    log_info "클라이언트 중지 중..."
    pm2 stop "$CLIENT_APP" 2>/dev/null || log_warning "클라이언트가 실행 중이 아닙니다."
    log_success "클라이언트가 중지되었습니다."
}

# 모든 앱 중지
stop_all() {
    log_info "모든 앱 중지 중..."
    pm2 stop all
    log_success "모든 앱이 중지되었습니다."
}

# 모든 앱 삭제
delete_all() {
    log_info "모든 앱 삭제 중..."
    pm2 delete all
    log_success "모든 앱이 삭제되었습니다."
}

# 상태 확인
status() {
    log_info "PM2 상태 확인 중..."
    pm2 list
}

# 로그 확인
logs() {
    local app_name="$1"
    if [ -z "$app_name" ]; then
        log_info "모든 로그 확인 중..."
        pm2 logs
    else
        log_info "$app_name 로그 확인 중..."
        pm2 logs "$app_name"
    fi
}

# 모니터링
monitor() {
    log_info "PM2 모니터링 시작 중..."
    pm2 monit
}

# 재시작
restart() {
    local app_name="$1"
    if [ -z "$app_name" ]; then
        log_info "모든 앱 재시작 중..."
        pm2 restart all
    else
        log_info "$app_name 재시작 중..."
        pm2 restart "$app_name"
    fi
}

# 도움말
show_help() {
    echo "Vietcoin PM2 관리 스크립트"
    echo ""
    echo "사용법: $0 [명령어] [옵션]"
    echo ""
    echo "명령어:"
    echo "  start           - 서버와 클라이언트 모두 시작"
    echo "  start-server    - 서버만 시작"
    echo "  start-client    - 클라이언트만 시작"
    echo "  stop            - 모든 앱 중지"
    echo "  stop-server     - 서버만 중지"
    echo "  stop-client     - 클라이언트만 중지"
    echo "  restart         - 모든 앱 재시작"
    echo "  restart-server  - 서버만 재시작"
    echo "  restart-client  - 클라이언트만 재시작"
    echo "  status          - PM2 상태 확인"
    echo "  logs            - 모든 로그 확인"
    echo "  logs-server     - 서버 로그 확인"
    echo "  logs-client     - 클라이언트 로그 확인"
    echo "  monitor         - PM2 모니터링"
    echo "  delete          - 모든 앱 삭제"
    echo "  help            - 이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 start        # 서버와 클라이언트 시작"
    echo "  $0 status       # 상태 확인"
    echo "  $0 monitor      # 모니터링"
}

# 메인 로직
main() {
    check_pm2
    
    case "$1" in
        "start")
            start_server
            start_client
            ;;
        "start-server")
            start_server
            ;;
        "start-client")
            start_client
            ;;
        "stop")
            stop_all
            ;;
        "stop-server")
            stop_server
            ;;
        "stop-client")
            stop_client
            ;;
        "restart")
            restart
            ;;
        "restart-server")
            restart "$SERVER_APP"
            ;;
        "restart-client")
            restart "$CLIENT_APP"
            ;;
        "status")
            status
            ;;
        "logs")
            logs
            ;;
        "logs-server")
            logs "$SERVER_APP"
            ;;
        "logs-client")
            logs "$CLIENT_APP"
            ;;
        "monitor")
            monitor
            ;;
        "delete")
            delete_all
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            log_error "알 수 없는 명령어: $1"
            show_help
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@" 