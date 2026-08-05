import React from 'react';
import { EssayCard, StudentProfile } from '../types';
import { ThumbsUp, MessageSquare, Edit2, Trash2, User, Clock, ChevronRight } from 'lucide-react';

interface EssayCardItemProps {
  card: EssayCard;
  profile: StudentProfile | null;
  onSelectCard: (card: EssayCard) => void;
  onToggleLike: (cardId: string) => void;
  onEditCard?: (card: EssayCard) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const EssayCardItem: React.FC<EssayCardItemProps> = ({
  card,
  profile,
  onSelectCard,
  onToggleLike,
  onEditCard,
  onDeleteCard,
}) => {
  const isAuthor = profile?.authorId === card.authorId;
  const isTeacher = profile?.isTeacher;
  const isLiked = profile?.authorId ? card.likedBy.includes(profile.authorId) : false;

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group">
      
      {/* Top Author & Badge Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-400">
              {card.studentId} {card.authorName}
            </span>
            {isAuthor && (
              <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full">
                내 글
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* New tag / Date */}
            <span className="text-[10px] text-slate-400 flex items-center space-x-0.5 mr-1">
              <Clock className="w-3 h-3 inline" />
              <span>{formatDate(card.createdAt)}</span>
            </span>

            {/* Action buttons if Author or Teacher */}
            {(isAuthor || isTeacher) && (
              <div className="flex items-center space-x-1">
                {isAuthor && onEditCard && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card);
                    }}
                    title="수정하기"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteCard && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('이 주장글 카드를 삭제하시겠습니까?')) {
                        onDeleteCard(card.id);
                      }
                    }}
                    title="삭제하기"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card Content Click Area */}
        <div onClick={() => onSelectCard(card)} className="cursor-pointer space-y-2.5">
          
          {/* Topic Title */}
          <h3 className="text-base font-extrabold text-slate-800 leading-snug">
            {card.topic}
          </h3>

          {/* Claim Highlight with Pink Theme from Design Spec */}
          <div className="bg-pink-50 border-l-3 border-pink-400 p-2.5 rounded-md">
            <p className="text-xs text-slate-800 font-semibold leading-relaxed line-clamp-2">
              "{card.claim}"
            </p>
          </div>

          {/* Reasons with Indigo Bullet */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-start gap-1.5">
              <span className="text-indigo-600 font-bold shrink-0">•</span>
              <p className="line-clamp-1 leading-snug">{card.reason1}</p>
            </div>
            {card.reason2 && (
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <p className="line-clamp-1 leading-snug">{card.reason2}</p>
              </div>
            )}
            {card.reason3 && (
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <p className="line-clamp-1 leading-snug">{card.reason3}</p>
              </div>
            )}
          </div>

          {/* Essay Preview snippet if exists */}
          {(card.introduction || card.body || card.conclusion) && (
            <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-100">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                서론-본론-결론 글
              </span>
              <span className="text-indigo-600 font-bold flex items-center group-hover:translate-x-0.5 transition-transform text-xs">
                전체보기 <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Footer Like & Comments Bar */}
      <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(card.id);
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
            isLiked
              ? 'text-rose-500 bg-rose-50 border border-rose-200'
              : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{card.likesCount || 0}</span>
        </button>

        {/* Comment count button */}
        <button
          onClick={() => onSelectCard(card)}
          className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>댓글 {card.commentsCount || 0}개</span>
        </button>

      </div>

    </div>
  );
};
