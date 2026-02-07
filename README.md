# Naver Dance Crew

네이버 댄스 크루 익명 커뮤니티 게시판

## Tech Stack

| 영역 | 기술 |
|------|------|
| Monorepo | Turborepo |
| Frontend | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4, Styled Components |
| Server State | TanStack Query (React Query) v5 |
| Database | Supabase (PostgreSQL) |
| Testing | Playwright (E2E) |

## Features

- **익명 게시판** — 로그인 없이 localStorage 기반 사용자 식별로 글/댓글 작성
- **좋아요** — 유저당 1회 토글 방식
- **YouTube 임베드** — 게시글 내 YouTube URL 자동 감지 및 플레이어 렌더링
- **신청곡 태그** — 태그 기반 게시글 분류
- **관리자 모드** — URL 쿼리 파라미터(`?adminzz=true`) 기반, 모든 글/댓글 수정·삭제 가능
- **이메일 알림** — 새 게시글 작성 시 Gmail SMTP를 통해 알림 발송

## Project Structure

```
naver-dance-crew/
├── apps/
│   └── homepage/                # 메인 Next.js 앱
│       ├── app/
│       │   ├── api/posts/       # REST API (CRUD, 댓글, 좋아요)
│       │   ├── board/           # 게시판 페이지
│       │   ├── layout.tsx
│       │   └── providers.tsx    # TanStack Query Provider
│       ├── components/          # 공통 컴포넌트 (BottomNav, LikeButton 등)
│       ├── lib/                 # 커스텀 훅 & API 클라이언트
│       └── types/               # TypeScript 타입 정의
├── packages/
│   ├── eslint-config/           # 공유 ESLint 설정
│   ├── typescript-config/       # 공유 tsconfig
│   └── ui/                      # 공유 UI 라이브러리
└── turbo.json
```

## Getting Started

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`apps/homepage/.env.example`을 복사하여 `.env.local`을 생성합니다.

```bash
cp apps/homepage/.env.example apps/homepage/.env.local
```

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `NEXT_PUBLIC_ADMIN_KEY` | 관리자 모드 활성화 쿼리 파라미터 값 |
| `SMTP_USER` | Gmail 발신 이메일 |
| `SMTP_PASS` | Gmail 앱 비밀번호 |
| `SMTP_DEST` | 알림 수신 이메일 |

### 3. Supabase 테이블

Supabase에 아래 테이블이 필요합니다.

- **posts** — `id`, `title`, `content`, `display_author`, `author_id`, `tags`, `is_admin`, `created_at`, `updated_at`
- **comments** — `id`, `post_id`, `content`, `display_author`, `author_id`, `is_admin`, `created_at`
- **likes** — `id`, `post_id`, `user_id` (unique: `post_id` + `user_id`)

RPC 함수: `get_comment_counts(post_ids)`, `get_like_counts(post_ids)`

### 4. 개발 서버 실행

```bash
# 전체 실행
npx turbo dev

# homepage만 실행
npx turbo dev --filter=homepage
```

### 5. 빌드

```bash
npx turbo build --filter=homepage
```

### 6. E2E 테스트

```bash
cd apps/homepage
npx playwright test
```
