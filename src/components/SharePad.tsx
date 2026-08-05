import React, { useState } from 'react';
import { EssayCard, StudentProfile, SortOption } from '../types';
import { EssayCardItem } from './EssayCardItem';
import { Search, Filter, Layers, ThumbsUp, MessageSquare, Sparkles } from 'lucide-react';

interface SharePadProps {
  cards: EssayCard[];
  profile: StudentProfile | null;
  onSelectCard: (card: EssayCard) => void;
  onToggleLike: (cardId: string) => void;
  onEditCard: (card: EssayCard) => void;
  onDeleteCard: (cardId: string) => void;
  onScrollToWriter: () => void;
}

export const SharePad: React.FC<SharePadProps> = ({
  cards,
  profile,
  onSelectCard,
  onToggleLike,
  onEditCard,
  onDeleteCard,
  onScrollToWriter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMineOnly, setFilterMineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter & Search Logic
  const filteredCards = cards.filter((card) => {
    if (filterMineOnly && profile?.authorId) {
      if (card.authorId !== profile.authorId) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = card.topic.toLowerCase().includes(q);
      const matchClaim = card.claim.toLowerCase().includes(q);
      const matchAuthor = card.authorName.toLowerCase().includes(q);
      const matchStudentId = card.studentId.toLowerCase().includes(q);
      return matchTopic || matchClaim || matchAuthor || matchStudentId;
    }

    return true;
  });

  // Sort Logic
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'likes') {
      return b.likesCount - a.likesCount;
    }
    if (sortBy === 'comments') {
      return (b.commentsCount || 0) - (a.commentsCount || 0);
    }
    // Default 'newest'
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Total stats
  const totalLikes = cards.reduce((acc, c) => acc + c.likesCount, 0);
  const totalComments = cards.reduce((acc, c) => acc + (c.commentsCount || 0), 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      
      {/* Share Pad Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
              실시간 공유 패드
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
              방금 업데이트됨 ({cards.length}명 제출)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            친구들이 제출한 개요 카드를 둘러보고 공감과 피드백을 나눠보세요!
          </p>
        </div>

        {/* Stats summary pill */}
        <div className="flex items-center space-x-3 text-xs bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 shrink-0 shadow-2xs">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-bold">{totalLikes}</span>
            <span className="text-slate-400">공감</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-bold">{totalComments}</span>
            <span className="text-slate-400">피드백</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주제, 주장, 학생 이름으로 검색..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 shrink-0 text-xs">
          
          {/* Mine filter toggle */}
          {profile && (
            <button
              onClick={() => setFilterMineOnly(!filterMineOnly)}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                filterMineOnly
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>내 카드만</span>
            </button>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-indigo-400"
          >
            <option value="newest">⏰ 최신순</option>
            <option value="likes">❤️ 공감 많은순</option>
            <option value="comments">💬 피드백 많은순</option>
          </select>

        </div>
      </div>

      {/* Cards List Grid */}
      {sortedCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {searchQuery || filterMineOnly
              ? '검색 결과에 맞는 주장글 카드가 없습니다.'
              : '아직 학급 친구들의 주장글 카드가 등록되지 않았습니다.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            좌측 개요 작성기에서 내 주장과 근거를 정리한 후 첫 번째로 나눔 패드에 올려보세요!
          </p>
          <button
            onClick={onScrollToWriter}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition"
          >
            <span>지금 작성하러 가기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCards.map((card) => (
            <EssayCardItem
              key={card.id}
              card={card}
              profile={profile}
              onSelectCard={onSelectCard}
              onToggleLike={onToggleLike}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </div>
      )}

    </div>
  );
};
