---
name: web-app-setup
description: Next.js 15 웹 애플리케이션 신규 세팅
allowed-tools: Bash, Write, Edit, Read, TodoWrite
---

# Web App 신규 세팅 스킬

Next.js 15 기반 웹 애플리케이션을 자동으로 세팅합니다.

## 역할

사용자 요청 시 Next.js 15 + TypeScript + TailwindCSS + styled-components + Supabase + TanStack Query 스택으로 프로젝트를 세팅합니다.

**중요**: 현재 환경은 Turborepo monorepo입니다. 모든 웹 애플리케이션은 `apps/` 폴더 하위에 생성되어야 합니다.

**패키지 매니저**: npm을 사용합니다.

## 기술 스택

- **Next.js 15**: App Router
- **TypeScript**: 타입 안정성
- **TailwindCSS**: 유틸리티 CSS
- **styled-components**: CSS-in-JS
- **Supabase**: 백엔드 서비스
- **TanStack Query**: 서버 상태 관리
- **Playwright**: E2E 테스트

## 실행 절차

### 1. 작업 계획 생성

TodoWrite로 다음 작업 목록 생성:
- 앱 이름 확인 및 apps 폴더로 이동
- Next.js 프로젝트 초기화
- 필수 패키지 설치
- styled-components 설정
- TanStack Query 설정
- Supabase 설정
- Playwright 설정
- 기본 폴더 구조 생성
- 환경변수 템플릿 생성

### 2. 앱 디렉토리 준비

**Monorepo 환경 고려사항:**

1. 사용자에게 앱 이름 확인 (예: `web`, `admin`, `mobile-web` 등)
2. `apps/[앱이름]` 디렉토리로 이동 또는 생성

```bash
# apps 폴더가 없으면 생성
mkdir -p apps

# 앱 디렉토리로 이동
cd apps/[앱이름]
```

### 3. Next.js 프로젝트 초기화

앱 디렉토리 내에서 실행:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

- TypeScript 활성화
- TailwindCSS 포함
- App Router 사용
- src 디렉토리 미사용
- `@/*` import alias 설정

### 4. 필수 패키지 설치

앱의 package.json에 패키지 추가:

```bash
cd apps/[앱이름]

npm install styled-components @supabase/supabase-js @tanstack/react-query
npm install -D @types/styled-components babel-plugin-styled-components @playwright/test
```

### 5. next.config.ts 수정

styled-components 컴파일러 설정 추가:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
```

### 6. TanStack Query Provider 생성

파일: `app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 7. Supabase 클라이언트 생성

파일: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 8. Playwright 설정

#### 8-1. playwright.config.ts 생성

파일: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 8-2. E2E 테스트 기본 구조 생성

다음 디렉토리 및 파일 생성:

```bash
mkdir -p e2e/fixtures e2e/helpers e2e/page-objects
```

파일: `e2e/fixtures/base.ts`

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  // 공통 fixtures (인증, 데이터 초기화 등)
});

export { expect } from '@playwright/test';
```

파일: `e2e/example.spec.ts` (샘플 테스트)

```typescript
import { test, expect } from './fixtures/base';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next.js/);
});
```

#### 8-3. package.json에 테스트 스크립트 추가

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

#### 8-4. .env.test 파일 생성

파일: `.env.test`

```
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-supabase-anon-key
```

### 9. Root Layout 수정

`app/layout.tsx` 파일을 읽고 Providers로 children을 감싸도록 수정:

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 10. 기본 폴더 구조 생성

다음 디렉토리 생성:

```bash
mkdir -p app/api app/\(routes\) lib components/ui hooks types styles e2e/fixtures e2e/helpers e2e/page-objects
```

최종 구조:
```
app/
├── api/           # API 라우트
├── (routes)/      # 페이지 그룹
├── layout.tsx
├── page.tsx
├── providers.tsx
lib/
├── supabase.ts
components/
├── ui/            # 재사용 컴포넌트
hooks/             # 커스텀 훅
types/             # 타입 정의
styles/            # 전역 스타일
e2e/
├── fixtures/      # 공통 fixtures
├── helpers/       # 헬퍼 함수
├── page-objects/  # Page Object Model
└── *.spec.ts      # 테스트 파일
```

### 11. 환경변수 템플릿 생성

파일: `.env.example`

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 12. .gitignore 확인 및 업데이트

`.env.local`과 Playwright 관련 파일이 포함되어 있는지 확인하고, 없으면 추가:

```
# 환경변수
.env.local
.env.test

# Playwright
test-results/
playwright-report/
playwright/.cache/
```

## 출력 형식

각 단계 완료 시 TodoWrite로 상태 업데이트.

최종 완료 시 다음 메시지 출력:

```
✓ Next.js 웹 애플리케이션 세팅 완료
  위치: apps/[앱이름]

설치된 스택:
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- styled-components
- Supabase
- TanStack Query

다음 단계:
1. .env.local 파일 생성 및 Supabase 환경변수 입력
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
2. 개발 서버 실행: npm run dev
3. http://localhost:3000에서 확인
```

## 제약 조건

- MUST: Turborepo monorepo 환경이므로 반드시 `apps/[앱이름]` 디렉토리 내에서 작업
- MUST: 프로젝트 생성 전 사용자에게 앱 이름 확인
- MUST: 각 명령 실행 전 현재 디렉토리 확인 (apps/[앱이름] 경로 확인)
- MUST: 에러 발생 시 즉시 사용자에게 알림 및 중단
- MUST: 패키지 설치는 npm 사용
- MUST: 모든 설정 파일은 TypeScript 우선 (.ts > .js)
- SHOULD: 기존 파일 존재 시 덮어쓰기 전 확인 또는 건너뛰기
- SHOULD: 설치 완료 후 `npm run build` 테스트 실행

## 에러 처리

### 1. apps 폴더가 없는 경우
- 자동으로 apps 폴더 생성
- monorepo 구조 확인 메시지 출력

### 2. 디렉토리가 비어있지 않은 경우
- 기존 파일 확인 후 계속 진행할지 사용자에게 확인
- 충돌 가능성 경고

### 3. 패키지 설치 실패
- 에러 메시지 출력
- npm 캐시 정리 제안: `npm cache clean --force`

### 4. Node.js 버전 호환성
- Node.js 18+ 필요
- 버전 확인: `node -v`
- 필요 시 업그레이드 안내
