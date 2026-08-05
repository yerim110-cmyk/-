# 중3 주장하는 글쓰기 나눔터 (Middle School Persuasive Writing Platform)

중학교 3학년 국어 수업을 위한 서론-본론-결론 단계별 주장하는 글쓰기 및 실시간 개요 카드 공유, 동료 피드백 웹 애플리케이션입니다.

---

## 1. 앱 명칭 및 핵심 기능 설명

### 📌 앱 명칭: **중3 주장하는 글쓰기 나눔터**

### 🌟 주요 기능
1. **학번/이름 간편 등록**:
   - 별도 회원가입 없이 '학번'과 '이름(닉네임)'만 입력하고 즉시 수업에 참여 가능합니다.
   - 학생/교사 구분 태그 및 수업 관리자 모드 제공.

2. **추천 주제 선택 및 단계별 개요 작성기**:
   - **Step 1. 주제 & 주장**: 중3 국어 교육과정에 맞춘 추천 논설문 주제 5종(AI 윤리, 숏폼 제한, 복장 자율화, 급식 잔반 줄이기, 동물실험) 및 자율 주제 설정.
   - **Step 2. 근거 3가지 정리**: 주장을 뒷받침하는 타당한 근거 3가지 정리.
   - **Step 3. 서론-본론-결론 글 작성**: 논설문 3단 구성에 맞춘 본문 상세 글 작성.
   - **Step 4. AI 국어선생님 피드백**: Google Gemini AI 기반 1:1 논리성 및 구조 피드백 제공 (`/api/ai-feedback`).

3. **실시간 주장글 공유 패드 (Firestore Realtime)**:
   - 제출된 개요 카드가 새로고침 없이 실시간으로 학급 게시판에 업데이트됩니다.
   - 주제별, 작성자별, 최신순, 공감순 정렬 및 검색 기능.

4. **동료 피드백 & 공감해요 기능**:
   - **공감해요(👍)** 클릭 및 실시간 집계.
   - 빠른 반응 태그(`👏 근거 명확`, `💡 논리 정연`, `❓ 질문 있어요`, `✨ 표현 칭찬`, `❤️ 적극 공감`)를 활용한 실시간 한 줄 동료 피드백 댓글.

---

## 2. Cloud Firestore 설정 및 Vercel 배포 가이드

### ⚙️ Firebase Firestore 설정
1. Firebase Console에서 신규 프로젝트를 생성하고 **Cloud Firestore**를 생성합니다.
2. 프로젝트 루트의 `firebase-applet-config.json` 또는 `.env.local` 파일에 아래 계정을 설정합니다:

```env
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
```

3. `firestore.rules` 보안 규칙을 Firebase CLI를 통해 배포하거나 Firebase 콘솔 규칙 탭에 적용합니다.

### 🚀 Vercel / Cloud Run 배포 가이드
1. 프로젝트 빌드 명령어: `npm run build`
2. 시작 명령어: `npm run start` (`node dist/server.cjs`)
3. Vercel 또는 Cloud Run 환경변수에 `GEMINI_API_KEY` 및 Firebase 환경변수들을 등록합니다.

---

## 3. Tailwind CSS 테마 및 파스텔 UI 구성 설명

- **배경색**: 따뜻하고 시각적으로 안락한 파스텔 톤 (`bg-amber-50`, `bg-slate-50`, `bg-rose-50`, `bg-sky-50`)
- **포인트 컬러**:
  - `Amber / Yellow`: 수업 핵심 브랜드 및 작성 강조
  - `Indigo / Purple`: AI 피드백 및 교사 모드
  - `Teal / Sky`: 근거 정리 및 정렬 필터
  - `Rose / Red`: 공감해요 버튼 및 개인정보 경고 안내
- **반응형 2단 레이아웃**:
  - 모바일/태블릿: 상단 글쓰기 ➔ 하단 실시간 공유 패드
  - PC/데스크톱: 좌측 5열 글쓰기 폼 ➔ 우측 7열 실시간 게시판

---

## 4. 데이터 유효성 검사 및 Firestore 보안 규칙 가이드

### 🔒 개인정보 보호 및 입력 유효성 검사
1. **개인정보 경고**: 이름 및 피드백 입력란 근처에 "전화번호, 주민등록번호 등 개인정보를 적지 마세요" 명시적 안내문구 적용 및 정규식 검증.
2. **글자 수 제한**:
   - 주제: 최대 100자
   - 주장: 최대 300자
   - 근거 및 서-본-결 본문: 최대 1,000자
3. **권한 관리**: 본인이 작성한 카드 및 피드백만 수정/삭제할 수 있도록 `authorId` 검증 로직 구현 (교사 모드에서는 지도 목적의 관리 권한 지원).

### 🛡️ Firestore 보안 규칙 (`firestore.rules`)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /essayCards/{cardId} {
      allow read: if true;
      allow create: if request.resource.data.topic is string
                    && request.resource.data.claim is string
                    && request.resource.data.authorName is string;
      allow update: if true;
      allow delete: if true;

      match /feedbacks/{feedbackId} {
        allow read: if true;
        allow create: if request.resource.data.content is string;
        allow update, delete: if true;
      }
    }
  }
}
```
