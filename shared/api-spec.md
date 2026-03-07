# API 명세서 - 대학 동문 SNS 플랫폼

> Base URL: `/api/v1`
> 인증: Bearer JWT
> Content-Type: application/json

---

## 1. 인증 (Auth)

### POST /auth/register - 회원가입 신청
```
Body: { email, password, name, phone?, university, department?, admissionYear?, graduationYear?, studentId?, bio?, company?, position?, location? }
Response 201: { id, email, name, status: "PENDING" }
```

### POST /auth/login - 로그인
```
Body: { email, password }
Response 200: { accessToken, refreshToken, user }
```

### POST /auth/refresh - 토큰 갱신
```
Body: { refreshToken }
Response 200: { accessToken, refreshToken }
```

### POST /auth/oauth/kakao - 카카오 로그인
```
Body: { code }
Response 200: { accessToken, refreshToken, user, isNewUser }
```

### POST /auth/oauth/google - 구글 로그인
```
Body: { code }
Response 200: { accessToken, refreshToken, user, isNewUser }
```

### POST /auth/logout - 로그아웃
```
Headers: Authorization: Bearer {token}
Response 200: { message }
```

---

## 2. 회원 (Users)

### GET /users/me - 내 프로필
```
Response 200: { User 전체 필드 (password 제외) }
```

### PATCH /users/me - 프로필 수정
```
Body: { name?, phone?, bio?, company?, position?, location?, website?, profileImage? }
Response 200: { User }
```

### GET /users/:id - 회원 프로필 조회
```
Response 200: { User (공개 필드만) }
```

### GET /users - 회원 목록 (검색)
```
Query: { page, limit, search?, department?, admissionYear? }
Response 200: { data: User[], total, page, totalPages }
```

### PATCH /users/:id/approve - 가입 승인 [PRESIDENT]
```
Response 200: { User with status: "ACTIVE" }
```

### PATCH /users/:id/reject - 가입 거절 [PRESIDENT]
```
Response 200: { message }
```

### PATCH /users/:id/role - 역할 변경 [PRESIDENT]
```
Body: { role: "VICE_PRESIDENT" | "TREASURER" | "MEMBER" }
Response 200: { User }
```

### DELETE /users/:id - 강제 탈퇴 [PRESIDENT]
```
Response 200: { message }
```

### GET /users/pending - 승인 대기 목록 [PRESIDENT]
```
Response 200: { data: User[] }
```

---

## 3. 게시판 (Posts)

### GET /posts - 게시글 목록
```
Query: { page, limit, category?, search? }
Response 200: { data: Post[], total, page, totalPages }
```

### GET /posts/:id - 게시글 상세
```
Response 200: { Post + author + comments + likeCount }
```

### POST /posts - 게시글 작성
```
Body: { title, content, category?, images? }
Response 201: { Post }
```

### PATCH /posts/:id - 게시글 수정 (작성자/관리자)
```
Body: { title?, content?, category?, images? }
Response 200: { Post }
```

### DELETE /posts/:id - 게시글 삭제 (작성자/관리자)
```
Response 200: { message }
```

### POST /posts/:id/like - 좋아요 토글
```
Response 200: { liked: boolean, likeCount: number }
```

### PATCH /posts/:id/pin - 게시글 고정 [PRESIDENT, VICE_PRESIDENT]
```
Response 200: { Post }
```

---

## 4. 댓글 (Comments)

### GET /posts/:postId/comments - 댓글 목록
```
Response 200: { data: Comment[] (대댓글 포함) }
```

### POST /posts/:postId/comments - 댓글 작성
```
Body: { content, parentId? }
Response 201: { Comment }
```

### PATCH /comments/:id - 댓글 수정
```
Body: { content }
Response 200: { Comment }
```

### DELETE /comments/:id - 댓글 삭제
```
Response 200: { message }
```

---

## 5. 공지사항 (Announcements)

### GET /announcements - 공지 목록
```
Query: { page, limit }
Response 200: { data: Announcement[], total }
```

### POST /announcements - 공지 작성 [PRESIDENT, VICE_PRESIDENT]
```
Body: { title, content, isPinned? }
Response 201: { Announcement }
```

### PATCH /announcements/:id - 공지 수정
```
Body: { title?, content?, isPinned? }
Response 200: { Announcement }
```

### DELETE /announcements/:id - 공지 삭제
```
Response 200: { message }
```

---

## 6. 모임 (Meetings)

### GET /meetings - 모임 목록
```
Query: { page, limit, status? }
Response 200: { data: Meeting[] + memberCount, total }
```

### GET /meetings/:id - 모임 상세
```
Response 200: { Meeting + members }
```

### POST /meetings - 모임 생성
```
Body: { title, description?, location?, date, maxMembers?, fee? }
Response 201: { Meeting }
```

### PATCH /meetings/:id - 모임 수정
```
Body: { title?, description?, location?, date?, maxMembers?, fee?, status? }
Response 200: { Meeting }
```

### DELETE /meetings/:id - 모임 삭제
```
Response 200: { message }
```

### POST /meetings/:id/rsvp - 참석 응답
```
Body: { rsvp: "ATTENDING" | "NOT_ATTENDING" | "MAYBE" }
Response 200: { MeetingMember }
```

---

## 7. 채팅 (Chat)

### GET /chat/rooms - 채팅방 목록
```
Response 200: { data: ChatRoom[] + lastMessage + unreadCount }
```

### POST /chat/rooms - 채팅방 생성
```
Body: { name?, type, memberIds: string[] }
Response 201: { ChatRoom }
```

### GET /chat/rooms/:id/messages - 메시지 목록
```
Query: { cursor?, limit }
Response 200: { data: ChatMessage[], nextCursor }
```

### Socket.IO /chat 네임스페이스
```
Events:
  - join_room(roomId)
  - leave_room(roomId)
  - send_message({ roomId, content, images? })
  - new_message (서버 → 클라이언트)
  - typing({ roomId, userId })
  - read_messages({ roomId })
```

---

## 8. DM (Direct Messages)

### GET /dm - DM 대화 목록
```
Response 200: { data: [{ user, lastMessage, unreadCount }] }
```

### GET /dm/:userId - 특정 유저와 DM 내역
```
Query: { cursor?, limit }
Response 200: { data: DirectMessage[], nextCursor }
```

### POST /dm/:userId - DM 전송
```
Body: { content }
Response 201: { DirectMessage }
```

### PATCH /dm/:userId/read - 읽음 처리
```
Response 200: { message }
```

---

## 9. 회비/회계 (Finance)

### GET /fees/schedules - 회비 일정 목록
```
Response 200: { data: FeeSchedule[] }
```

### POST /fees/schedules - 회비 일정 생성 [TREASURER, PRESIDENT]
```
Body: { type, amount, dueDate, description? }
Response 201: { FeeSchedule }
```

### GET /fees/schedules/:id/payments - 특정 회비 납부 현황
```
Response 200: { data: FeePayment[] + user }
```

### POST /fees/payments/:scheduleId - 납부 등록
```
Body: { amount, receiptImage? }
Response 201: { FeePayment }
```

### PATCH /fees/payments/:id/confirm - 납부 확인 [TREASURER]
```
Response 200: { FeePayment with status: "PAID" }
```

### GET /finance/books - 회계 장부
```
Query: { page, limit, type?, startDate?, endDate? }
Response 200: { data: AccountBook[], summary: { totalIncome, totalExpense, balance } }
```

### POST /finance/books - 회계 기록 추가 [TREASURER]
```
Body: { type, amount, description, date, category?, receiptUrl? }
Response 201: { AccountBook }
```

---

## 10. 알림 (Notifications)

### GET /notifications - 알림 목록
```
Query: { page, limit, unreadOnly? }
Response 200: { data: Notification[], unreadCount }
```

### PATCH /notifications/:id/read - 알림 읽음
```
Response 200: { Notification }
```

### PATCH /notifications/read-all - 전체 읽음
```
Response 200: { message }
```

---

## 11. 파일 업로드

### POST /upload/image - 이미지 업로드
```
Body: multipart/form-data { file }
Response 200: { url: string }
```

---

## 공통 에러 응답
```json
{
  "statusCode": 400 | 401 | 403 | 404 | 500,
  "message": "에러 메시지",
  "error": "BadRequest" | "Unauthorized" | "Forbidden" | "NotFound" | "InternalServerError"
}
```

## 페이지네이션 규칙
- page: 1부터 시작
- limit: 기본 20, 최대 100
- 커서 기반: cursor (마지막 ID), limit
