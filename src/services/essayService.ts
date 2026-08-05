import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase';
import { EssayCard, PeerFeedback } from '../types';

const LOCAL_STORAGE_CARDS_KEY = 'm3_korean_essay_cards_v1';
const LOCAL_STORAGE_FEEDBACKS_PREFIX = 'm3_korean_feedbacks_v1_';

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('m3_essay_channel')
  : null;

// Preset sample middle school persuasive essay cards for inspiring students
export const SAMPLE_ESSAY_CARDS: EssayCard[] = [
  {
    id: 'sample-1',
    topic: '생성형 AI의 학교 과제 활용과 윤리',
    claim: '생성형 AI는 학습 보조 도구로 적극 활용하되, 올바른 윤리 수칙과 출처 명시 가이드라인을 정해야 한다.',
    reason1: 'AI는 정보 탐색과 비판적 사고의 아이디어를 얻는 유용한 도구가 될 수 있다.',
    reason2: '무조건적인 사용 금지보다는 올바른 인용 규칙과 윤리 교육이 청소년의 미디어 리터러시를 높인다.',
    reason3: '표절이나 베끼기를 방지하기 위해 자신만의 생각과 판단을 덧붙이는 평가 기준이 마련되어야 한다.',
    introduction: '최근 ChatGPT 등 생성형 AI가 보급되면서 학생들이 과제나 글쓰기에 AI를 활용하는 사례가 늘고 있다. 이에 대해 표절 우려로 전면 금지해야 한다는 의견과 미래 기술 변화에 맞춰 적극 도입해야 한다는 의견이 대립하고 있다.',
    body: '첫째, AI는 학생들의 창의적 아이디어 발상을 돕는 우수한 학습 보조 수단이다. 모르는 개념을 쉽게 설명받고 다양한 관점을 비교해볼 수 있다. 둘째, AI를 무조건 막는 것은 시대적 흐름에 역행하는 일이다. 오히려 AI가 생성한 답변의 사실 여부를 검증하고 오류를 찾아내는 비판적 사고력을 길러주는 수업이 필요하다. 셋째, 과제 작성 시 AI 활용 범위를 명확히 규정하고 출처를 밝히도록 하여 무단 표절을 방지하는 정당한 윤리 기준을 세워야 한다.',
    conclusion: '결국 생성형 AI는 도구일 뿐이다. 올바른 윤리적 가이드라인 속에서 AI를 지혜롭게 활용할 때, 우리 중학생들의 문제 해결 능력과 미래 역량은 한층 더 성장할 것이다.',
    authorName: '박국어',
    studentId: '3학년 2반 14번',
    authorId: 'sample-author-1',
    likesCount: 5,
    likedBy: ['sample-user-a', 'sample-user-b'],
    commentsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sample-2',
    topic: '중학교 두발 및 복장 자율화 논란',
    claim: '학생들의 자율성과 표현의 자유를 존중하기 위해 중학교 복장 규정을 완화하고 편한 생활복을 확대해야 한다.',
    reason1: '기존의 빡빡한 교복은 활동성을 저하시키고 학생들의 신체적 편안함을 방해한다.',
    reason2: '의복 선택권을 제공함으로써 학생 스스로 책임감을 배우는 민주시민 교육이 이루어진다.',
    reason3: '계절 변화에 맞춘 자율적인 옷차림은 학생 건강 증진과 집중력 향상에 도움을 준다.',
    introduction: '우리 학교는 아침마다 용모 및 교복 착용 상태를 단속하고 있다. 그러나 뻣뻣한 교복 재킷과 구두는 운동이나 장시간 공부할 때 큰 불편을 초래한다.',
    body: '첫째, 옷은 신체를 보호하고 편안함을 주는 기본 기능을 해야 한다. 현재 교복 재질은 땀 흡수가 어렵고 활동에 불편하다. 둘째, 복장 자율화는 청소년에게 개성과 자율성을 부여하는 계기가 된다. 스스로 상황에 적절한 옷을 고르는 과정 또한 중요한 배움이다. 셋째, 타 학교의 생활복 도입 사례를 보면 학생들의 만족도와 수업 집중도가 크게 향상되었다.',
    conclusion: '따라서 과도한 교복 규제를 완화하고 편안한 생활복과 자율 복장을 확대하는 것이 진정한 학생 인권 존중의 시작이다.',
    authorName: '이논리',
    studentId: '3학년 1반 03번',
    authorId: 'sample-author-2',
    likesCount: 8,
    likedBy: ['sample-user-c'],
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'sample-3',
    topic: '학교 급식 잔반 줄이기와 일회용품 절감',
    claim: '지구 온난화와 탄소 중립을 위해 학교 급식 잔반 제로 요일제와 친환경 잔반 저감 마일리지제를 도입해야 한다.',
    reason1: '급식 잔반 처리에 들어가는 온실가스 배출량이 지구 환경을 위협하고 있다.',
    reason2: '학생들의 식습관 개선과 음식의 소중함을 깨닫는 인성 교육 효과가 크다.',
    reason3: '음식물 쓰레기 처리 비용을 줄여 급식의 질을 오히려 높일 수 있다.',
    introduction: '매일 우리 학교 급식실에서 버려지는 음식물 쓰레기의 양이 수십 kg에 달한다. 먹지 않고 버려지는 음식은 심각한 환경 오염과 자원 낭비를 유발한다.',
    body: '첫째, 음식물 쓰레기가 부패할 때 발생하는 메탄가스는 지구 온난화의 주범이다. 둘째, 잔반 잔여량을 확인하고 칭찬 스티커를 부여하는 잔반 저감 제도를 운영하면 자연스럽게 편식 습관이 개선된다. 셋째, 절감된 잔반 처리 비용으로 학생들이 좋아하는 과일과 후식을 제공할 수 있어 일석이조이다.',
    conclusion: '작은 잔반 줄이기 실천이 기후 위기를 막는 큰 첫걸음이 된다. 전교생이 적극적으로 동참해 줄 것을 당부한다.',
    authorName: '최환경',
    studentId: '3학년 3반 21번',
    authorId: 'sample-author-3',
    likesCount: 4,
    likedBy: [],
    commentsCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

// Helper to get local cards
function getLocalCards(): EssayCard[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_CARDS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(SAMPLE_ESSAY_CARDS));
      return SAMPLE_ESSAY_CARDS;
    }
    return JSON.parse(data);
  } catch (e) {
    return SAMPLE_ESSAY_CARDS;
  }
}

function saveLocalCards(cards: EssayCard[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(cards));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'CARDS_UPDATED' });
    }
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Subscribe to cards in real-time
export function subscribeToEssayCards(callback: (cards: EssayCard[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const cardsQuery = query(collection(db, 'essayCards'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        cardsQuery,
        (snapshot) => {
          const cards: EssayCard[] = [];
          snapshot.forEach((doc) => {
            cards.push({ id: doc.id, ...doc.data() } as EssayCard);
          });
          callback(cards);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'essayCards');
          // Fallback to local storage if Firestore connection fails
          callback(getLocalCards());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscription failed, falling back to local storage.');
    }
  }

  // Local fallback with BroadcastChannel listener
  callback(getLocalCards());

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'CARDS_UPDATED') {
      callback(getLocalCards());
    }
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_CARDS_KEY) {
      callback(getLocalCards());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorageChange);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorageChange);
  };
}

// Add new Essay Card
export async function addEssayCard(card: Omit<EssayCard, 'id' | 'likesCount' | 'likedBy' | 'commentsCount' | 'createdAt'>): Promise<string> {
  const newId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newCard: EssayCard = {
    ...card,
    id: newId,
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', newId);
      await setDoc(docRef, newCard);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `essayCards/${newId}`);
    }
  }

  // Local fallback
  const cards = getLocalCards();
  const updated = [newCard, ...cards];
  saveLocalCards(updated);
  return newId;
}

// Update Essay Card (Only by author)
export async function updateEssayCard(cardId: string, updatedFields: Partial<EssayCard>, authorId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', cardId);
      await updateDoc(docRef, {
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `essayCards/${cardId}`);
    }
  }

  // Local fallback
  const cards = getLocalCards();
  const index = cards.findIndex((c) => c.id === cardId);
  if (index !== -1) {
    if (cards[index].authorId !== authorId) {
      throw new Error('본인이 작성한 카드만 수정할 수 있습니다.');
    }
    cards[index] = {
      ...cards[index],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCards(cards);
    return true;
  }
  return false;
}

// Delete Essay Card (Only by author or teacher)
export async function deleteEssayCard(cardId: string, authorId: string, isTeacher = false): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', cardId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `essayCards/${cardId}`);
    }
  }

  // Local fallback
  const cards = getLocalCards();
  const target = cards.find((c) => c.id === cardId);
  if (target && !isTeacher && target.authorId !== authorId) {
    throw new Error('본인이 작성한 카드만 삭제할 수 있습니다.');
  }

  const updated = cards.filter((c) => c.id !== cardId);
  saveLocalCards(updated);
  return true;
}

// Toggle Like (공감해요)
export async function toggleLikeCard(cardId: string, userAuthorId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', cardId);
      // Determine if liked currently
      const cards = getLocalCards();
      const currentCard = cards.find((c) => c.id === cardId);
      const isAlreadyLiked = currentCard?.likedBy.includes(userAuthorId);

      if (isAlreadyLiked) {
        await updateDoc(docRef, {
          likedBy: arrayRemove(userAuthorId),
          likesCount: increment(-1),
        });
      } else {
        await updateDoc(docRef, {
          likedBy: arrayUnion(userAuthorId),
          likesCount: increment(1),
        });
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `essayCards/${cardId}`);
    }
  }

  // Local fallback
  const cards = getLocalCards();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex !== -1) {
    const card = cards[cardIndex];
    const liked = card.likedBy.includes(userAuthorId);
    if (liked) {
      card.likedBy = card.likedBy.filter((id) => id !== userAuthorId);
      card.likesCount = Math.max(0, card.likesCount - 1);
    } else {
      card.likedBy.push(userAuthorId);
      card.likesCount += 1;
    }
    cards[cardIndex] = { ...card };
    saveLocalCards(cards);
    return true;
  }
  return false;
}

// ---------------- PEER FEEDBACKS SERVICE ----------------

const SAMPLE_FEEDBACKS: Record<string, PeerFeedback[]> = {
  'sample-1': [
    {
      id: 'fb-1',
      cardId: 'sample-1',
      authorName: '이논리',
      studentId: '3학년 1반 03번',
      authorId: 'sample-author-2',
      category: '👏 근거 명확',
      content: '근거 2번에서 인용 규칙과 윤리 교육을 언급한 점이 매우 설득력 있어요!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'fb-2',
      cardId: 'sample-1',
      authorName: '최환경',
      studentId: '3학년 3반 21번',
      authorId: 'sample-author-3',
      category: '💡 논리 정연',
      content: '서론에서 AI의 문제점과 필요성을 균형 있게 제시해서 이해하기 좋았습니다.',
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
  ],
};

function getLocalFeedbacks(cardId: string): PeerFeedback[] {
  try {
    const data = localStorage.getItem(`${LOCAL_STORAGE_FEEDBACKS_PREFIX}${cardId}`);
    if (!data) {
      const samples = SAMPLE_FEEDBACKS[cardId] || [];
      localStorage.setItem(`${LOCAL_STORAGE_FEEDBACKS_PREFIX}${cardId}`, JSON.stringify(samples));
      return samples;
    }
    return JSON.parse(data);
  } catch (e) {
    return SAMPLE_FEEDBACKS[cardId] || [];
  }
}

function saveLocalFeedbacks(cardId: string, feedbacks: PeerFeedback[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_FEEDBACKS_PREFIX}${cardId}`, JSON.stringify(feedbacks));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'FEEDBACKS_UPDATED', cardId });
    }
  } catch (e) {
    console.error('Failed to save feedbacks:', e);
  }
}

export function subscribeToFeedbacks(cardId: string, callback: (feedbacks: PeerFeedback[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const feedbackQuery = query(
        collection(db, 'essayCards', cardId, 'feedbacks'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(
        feedbackQuery,
        (snapshot) => {
          const list: PeerFeedback[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as PeerFeedback);
          });
          callback(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `essayCards/${cardId}/feedbacks`);
          callback(getLocalFeedbacks(cardId));
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore feedback subscription failed, using local fallback.');
    }
  }

  callback(getLocalFeedbacks(cardId));

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'FEEDBACKS_UPDATED' && event.data?.cardId === cardId) {
      callback(getLocalFeedbacks(cardId));
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
  };
}

export async function addPeerFeedback(feedback: Omit<PeerFeedback, 'id' | 'createdAt'>): Promise<string> {
  const newId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newFeedback: PeerFeedback = {
    ...feedback,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', feedback.cardId, 'feedbacks', newId);
      await setDoc(docRef, newFeedback);

      // Increment comments count on parent card
      const cardRef = doc(db, 'essayCards', feedback.cardId);
      await updateDoc(cardRef, { commentsCount: increment(1) });
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `essayCards/${feedback.cardId}/feedbacks/${newId}`);
    }
  }

  // Local fallback
  const list = getLocalFeedbacks(feedback.cardId);
  const updated = [newFeedback, ...list];
  saveLocalFeedbacks(feedback.cardId, updated);

  // Update parent card commentsCount in local cards
  const cards = getLocalCards();
  const cardIndex = cards.findIndex((c) => c.id === feedback.cardId);
  if (cardIndex !== -1) {
    cards[cardIndex].commentsCount = (cards[cardIndex].commentsCount || 0) + 1;
    saveLocalCards(cards);
  }

  return newId;
}

export async function deletePeerFeedback(cardId: string, feedbackId: string, authorId: string, isTeacher = false): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'essayCards', cardId, 'feedbacks', feedbackId);
      await deleteDoc(docRef);

      const cardRef = doc(db, 'essayCards', cardId);
      await updateDoc(cardRef, { commentsCount: increment(-1) });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `essayCards/${cardId}/feedbacks/${feedbackId}`);
    }
  }

  // Local fallback
  const list = getLocalFeedbacks(cardId);
  const target = list.find((f) => f.id === feedbackId);
  if (target && !isTeacher && target.authorId !== authorId) {
    throw new Error('자신이 작성한 피드백만 삭제할 수 있습니다.');
  }

  const updated = list.filter((f) => f.id !== feedbackId);
  saveLocalFeedbacks(cardId, updated);

  const cards = getLocalCards();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  if (cardIndex !== -1) {
    cards[cardIndex].commentsCount = Math.max(0, (cards[cardIndex].commentsCount || 0) - 1);
    saveLocalCards(cards);
  }

  return true;
}
