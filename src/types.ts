export interface StudentProfile {
  studentId: string; // e.g., '30105' or '3학년 1반 5번'
  name: string;      // e.g., '김국어'
  authorId: string;  // Persistent client UUID for device identification
  isTeacher?: boolean;
  avatarColor?: string;
}

export interface EssayCard {
  id: string;
  topic: string;
  claim: string;
  reason1: string;
  reason2?: string;
  reason3?: string;
  introduction?: string;
  body?: string;
  conclusion?: string;
  authorName: string;
  studentId: string;
  authorId: string;
  likesCount: number;
  likedBy: string[]; // List of authorIds who clicked "공감해요"
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PeerFeedback {
  id: string;
  cardId: string;
  authorName: string;
  studentId: string;
  authorId: string;
  category: string; // e.g., '👏 근거 명확', '💡 논리 정연', '❓ 질문 있어요', '✨ 표현 칭찬', '❤️ 적극 공감'
  content: string;
  createdAt: string;
}

export interface TopicPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  sampleClaim?: string;
  sampleReasons?: string[];
}

export interface AiFeedbackResult {
  praise: string;
  evidenceFeedback: string;
  structureFeedback: string;
  recommendedComments: string[];
  scoreRating: '매우 우수' | '우수' | '발전 가능';
}

export type SortOption = 'newest' | 'likes' | 'comments';
