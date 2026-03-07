export type Role = 'PRESIDENT' | 'VICE_PRESIDENT' | 'TREASURER' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
export type PostCategory = 'FREE' | 'NEWS' | 'JOB' | 'MARKETPLACE';
export type MeetingStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type RSVPStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
export type NotificationType = 'APPROVAL' | 'POST' | 'COMMENT' | 'MEETING' | 'FEE' | 'ANNOUNCEMENT' | 'CHAT' | 'DM';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'EXEMPT';
export type FeeType = 'MONTHLY' | 'ANNUAL' | 'SPECIAL' | 'MEETING';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: Role;
  status: MemberStatus;
  university: string;
  department?: string;
  admissionYear?: number;
  graduationYear?: number;
  studentId?: string;
  bio?: string;
  company?: string;
  position?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  images: string[];
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  author: User;
  authorId: string;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  author: User;
  authorId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: string;
  maxMembers?: number;
  status: MeetingStatus;
  fee: number;
  members?: MeetingMember[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMember {
  id: string;
  meetingId: string;
  userId: string;
  user?: User;
  rsvp: RSVPStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  userId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'GROUP' | 'DM';
  lastMessage?: ChatMessage;
  unreadCount?: number;
  members?: ChatRoomMember[];
  createdAt: string;
}

export interface ChatRoomMember {
  id: string;
  chatRoomId: string;
  userId: string;
  user?: User;
  lastReadAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  images: string[];
  chatRoomId: string;
  senderId: string;
  sender?: User;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  content: string;
  isRead: boolean;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  author: User;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeSchedule {
  id: string;
  type: FeeType;
  amount: number;
  dueDate: string;
  description?: string;
  payments?: FeePayment[];
  createdAt: string;
}

export interface FeePayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  receiptImage?: string;
  scheduleId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface AccountBook {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  category?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CursorResponse<T> {
  data: T[];
  nextCursor?: string;
}

export interface AuthResponse {
  user: User;
}
