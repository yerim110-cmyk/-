import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, EssayCard } from './types';
import { Header } from './components/Header';
import { StudentLoginModal } from './components/StudentLoginModal';
import { EssayWriterForm } from './components/EssayWriterForm';
import { SharePad } from './components/SharePad';
import { EssayDetailModal } from './components/EssayDetailModal';
import { subscribeToEssayCards, toggleLikeCard, deleteEssayCard } from './services/essayService';
import { ShieldCheck, BookOpen, Heart, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_PROFILE_KEY = 'm3_korean_student_profile_v1';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load local profile:', e);
    }
    // Default guest profile
    return {
      studentId: '3학년 1반 01번',
      name: '국어선도부',
      authorId: `user_guest_${Math.random().toString(36).substring(2, 7)}`,
      isTeacher: false,
    };
  });

  const [cards, setCards] = useState<EssayCard[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<EssayCard | null>(null);
  const [editingCard, setEditingCard] = useState<EssayCard | null>(null);

  const writerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time Firestore / local storage cards
  useEffect(() => {
    const unsubscribe = subscribeToEssayCards((updatedCards) => {
      setCards(updatedCards);
      // Update selected card if open
      if (selectedCard) {
        const found = updatedCards.find((c) => c.id === selectedCard.id);
        if (found) setSelectedCard(found);
      }
    });
    return () => unsubscribe();
  }, [selectedCard?.id]);

  // Save profile to local storage
  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  // Toggle Teacher mode
  const handleToggleTeacher = () => {
    if (!profile) return;
    const updated = { ...profile, isTeacher: !profile.isTeacher };
    handleSaveProfile(updated);
  };

  // Toggle Like on card
  const handleToggleLike = async (cardId: string) => {
    if (!profile) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await toggleLikeCard(cardId, profile.authorId);
    } catch (e: any) {
      console.error('Failed to toggle like:', e);
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId: string) => {
    if (!profile) return;
    try {
      await deleteEssayCard(cardId, profile.authorId, profile.isTeacher);
      if (selectedCard?.id === cardId) {
        setSelectedCard(null);
      }
    } catch (e: any) {
      alert(e.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  // Edit card handler
  const handleEditCard = (card: EssayCard) => {
    setEditingCard(card);
    if (writerRef.current) {
      writerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to writer section
  const handleScrollToWriter = () => {
    if (writerRef.current) {
      writerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* App Header */}
      <Header
        profile={profile}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleTeacher={handleToggleTeacher}
        onScrollToWriter={handleScrollToWriter}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Banner Alert for Privacy & Class Guidance */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">
                중3 국어 [주장하는 글쓰기] 단계별 수업 공간
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                주제선정 ➔ 핵심주장 ➔ 근거3가지 ➔ 서론-본론-결론 글 완성 후 학급 공유 패드에서 동료 피드백을 주고받으세요!
              </p>
            </div>
          </div>

          <div className="text-[11px] bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-900 font-semibold shrink-0">
            🔒 전화번호·주민번호 등 개인정보 입력 금지
          </div>
        </div>

        {/* 2-Column Desktop Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Essay Writer Form */}
          <div ref={writerRef} className="lg:col-span-5 space-y-6">
            <EssayWriterForm
              profile={profile}
              onRequireProfile={() => setIsLoginModalOpen(true)}
              onSubmitSuccess={() => setEditingCard(null)}
              editingCard={editingCard}
              onCancelEdit={() => setEditingCard(null)}
            />
          </div>

          {/* Right Column: Real-time Share Pad */}
          <div className="lg:col-span-7">
            <SharePad
              cards={cards}
              profile={profile}
              onSelectCard={(card) => setSelectedCard(card)}
              onToggleLike={handleToggleLike}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onScrollToWriter={handleScrollToWriter}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-700">
            중3 국어 수업용 주장하는 글쓰기 나눔터 | Firebase Realtime Firestore & Gemini AI
          </p>
          <p className="text-slate-400">
            동료 평가와 따뜻한 한 줄 피드백으로 더욱 풍성한 국어 수업을 만들어갑니다.
          </p>
        </div>
      </footer>

      {/* Login Profile Modal */}
      <StudentLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentProfile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Card Detail & Peer Feedback Modal */}
      <EssayDetailModal
        card={selectedCard}
        isOpen={Boolean(selectedCard)}
        onClose={() => setSelectedCard(null)}
        profile={profile}
        onRequireProfile={() => setIsLoginModalOpen(true)}
        onToggleLike={handleToggleLike}
      />

    </div>
  );
}
