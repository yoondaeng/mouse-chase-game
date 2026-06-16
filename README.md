# Mouse Chase Game

간단한 선택지 웹 페이지 게임입니다.

- 질문: 편의점 같이 가시겠습니까?
- 버튼 1: 좋아! (정상 클릭)
- 버튼 2: 싫어! (마우스가 가까워지면 도망)
- 도망 횟수 표시는 없음
- 도망 영역은 웹 페이지 전체 화면

## 실행 방법

1. `mouse-chase-game` 폴더로 이동
2. `index.html` 파일을 브라우저에서 열기

권장: 로컬 서버로 열면 모듈 스크립트 호환성이 더 좋습니다.

예시 (Python 사용 가능 시):

```bash
python -m http.server 5500
```

그 뒤 브라우저에서 `http://localhost:5500` 접속

## Nginx 배포 (Docker)

1. `mouse-chase-game` 폴더에서 이미지 빌드 및 컨테이너 실행

```bash
docker compose up -d --build
```

2. 브라우저 접속

```text
http://localhost:8080
```

3. 종료

```bash
docker compose down
```

Nginx 설정은 `nginx.conf`를 사용하며 정적 파일을 `/usr/share/nginx/html`에서 서빙합니다.

## GitHub 자동 재배포 (CI/CD)

워크플로우 파일: `.github/workflows/mouse-chase-game-cicd.yml`

- 트리거: `main` 브랜치로 푸시될 때 (`mouse-chase-game/**` 변경)
- 1단계: Docker 이미지 빌드 후 GHCR(`ghcr.io`)로 푸시
- 2단계: 배포용 시크릿이 설정된 경우 SSH로 서버 접속 후 자동 재배포

### GitHub Repository Secrets

자동 재배포까지 사용하려면 아래 시크릿을 저장소에 추가하세요.

- `DEPLOY_HOST`: 배포 서버 IP 또는 도메인
- `DEPLOY_USER`: SSH 사용자
- `DEPLOY_SSH_KEY`: SSH 개인 키 (PEM)
- `GHCR_PAT`: 서버에서 GHCR pull 할 때 사용할 PAT (`read:packages` 권한)

참고:

- 시크릿이 없으면 이미지 빌드/푸시만 수행됩니다.
- 서버에서는 `80` 포트를 사용해 컨테이너 `mouse-chase-web`이 재시작됩니다.

## Nginx 배포 (Windows nginx.zip, Docker 없이)

1. Nginx 다운로드

- 공식 사이트에서 Windows zip 다운로드: `https://nginx.org/en/download.html`
- 예시 압축 해제 경로: `C:\tools\nginx`

2. 프로젝트 파일 배치

- 프로젝트 폴더 `mouse-chase-game`을 예시 경로에 둡니다.
- 예시: `C:\Users\hanon\hands-on-labs\mouse-chase-game`

3. Nginx 설정 교체

- `C:\tools\nginx\conf\nginx.conf` 파일을 아래 내용으로 교체
- 경로는 본인 PC 경로에 맞게 수정

```nginx
worker_processes  1;

events {
	worker_connections  1024;
}

http {
	include       mime.types;
	default_type  application/octet-stream;
	sendfile      on;
	keepalive_timeout  65;

	server {
		listen       8080;
		server_name  localhost;

		root   C:/Users/hanon/hands-on-labs/mouse-chase-game;
		index  index.html;

		location / {
			try_files $uri $uri/ /index.html;
		}
	}
}
```

4. Nginx 시작

```powershell
cd C:\tools\nginx
.\nginx.exe
```

5. 접속 확인

- `http://localhost:8080`

6. Nginx 종료 또는 재시작

```powershell
cd C:\tools\nginx
.\nginx.exe -s quit
# 설정 재적용
.\nginx.exe -s reload
```

문제 해결:

- `bind() ... failed (10013/10048)` 오류가 나면 포트 8080을 이미 다른 프로세스가 사용 중입니다.
- `listen 8080;` 값을 `listen 8090;` 등으로 변경 후 다시 시작하세요.

## 파일 구조

- `index.html`: 화면 구조
- `src/styles/main.css`: 스타일
- `src/scripts/main.js`: 페이지 이벤트 연결
- `src/scripts/escape-button.js`: 싫어 버튼 도망 로직
- `nginx.conf`: Nginx 정적 서버 설정
- `Dockerfile`: Nginx 이미지 빌드 설정
- `docker-compose.yml`: 로컬 배포 실행 설정

