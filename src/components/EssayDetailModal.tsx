import React, { useState, useEffect } from 'react';
import { EssayCard, StudentProfile, PeerFeedback } from '../types';
import { subscribeToFeedbacks, addPeerFeedback, deletePeerFeedback } from '../services/essayService';
import {
  X,
  ThumbsUp,
  MessageSquare,
  Send,
  User,
  ShieldAlert,
  Trash2,
  BookOpen,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface EssayDetailModalProps {
  card: EssayCard | null;
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
  onRequireProfile: () => void;
  onToggleLike: (cardId: string) => void;
}

const FEEDBACK_TAGS = [
  '👏 근거 명확',
  '💡 논리 정연',
  '❓ 질문 있어요',
  '✨ 표현 칭찬',
  '❤️ 적극 공감',
];

export const EssayDetailModal: React.FC<EssayDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  profile,
  onRequireProfile,
  onToggleLike,
}) => {
  if (!isOpen || !card) return null;

  const [feedbacks, setFeedbacks] = useState<PeerFeedback[]>([]);
  const [selectedTag, setSelectedTag] = useState(FEEDBACK_TAGS[0]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLiked = profile?.authorId ? card.likedBy.includes(profile.authorId) : false;

  // Real-time feedback subscription
  useEffect(() => {
    const unsubscribe = subscribeToFeedbacks(card.id, (list) => {
      setFeedbacks(list);
    });
    return () => unsubscribe();
  }, [card.id]);

  // Submit new peer feedback
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      onRequireProfile();
      return;
    }

    if (!commentText.trim()) {
      setErrorMsg('피드백 내용을 입력해주세요.');
      return;
    }

    // Privacy warning check
    if (/\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(commentText) || /\d{6}[-.\s]?[1-4]\d{6}/.test(commentText)) {
      setErrorMsg('전화번호 등 개인정보가 포함되어 있지 않은지 확인해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addPeerFeedback({
        cardId: card.id,
        authorName: profile.name,
        studentId: profile.studentId,
        authorId: profile.authorId,
        category: selectedTag,
        content: commentText.trim(),
      });

      setCommentText('');
    } catch (err: any) {
      setErrorMsg(err.message || '피드백 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete feedback
  const handleDeleteComment = async (feedbackId: string) => {
    if (!profile) return;
    if (confirm('이 피드백을 삭제하시겠습니까?')) {
      try {
        await deletePeerFeedback(card.id, feedbackId, profile.authorId, profile.isTeacher);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">
                  {card.studentId} {card.authorName}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  주장글 카드
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-800">주제: {card.topic}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Claim Section */}
          <div className="p-4 bg-pink-50 border-l-4 border-pink-400 rounded-xl space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">나의 주장</h3>
            <p className="text-sm text-slate-800 font-extrabold leading-relaxed">
              "{card.claim}"
            </p>
          </div>

          {/* 3 Reasons Detailed */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <span>📌 뒷받침 근거 3가지</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-indigo-600 mr-2">• 근거 1:</span>
                <span className="text-slate-800 leading-relaxed font-semibold">{card.reason1}</span>
              </div>
              {card.reason2 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-indigo-600 mr-2">• 근거 2:</span>
                  <span className="text-slate-800 leading-relaxed font-semibold">{card.reason2}</span>
                </div>
              )}
              {card.reason3 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-indigo-600 mr-2">• 근거 3:</span>
                  <span className="text-slate-800 leading-relaxed font-semibold">{card.reason3}</span>
                </div>
              )}
            </div>
          </div>

          {/* Full Essay: Intro - Body - Conclusion */}
          {(card.introduction || card.body || card.conclusion) && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800">📖 서론-본론-결론 글</h3>
              
              {card.introduction && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">🔹 서론 (문제 제기)</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{card.introduction}</p>
                </div>
              )}

              {card.body && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 block">🔹 본론 (주장 및 근거 설명)</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{card.body}</p>
                </div>
              )}

              {card.conclusion && (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block">🔹 결론 (핵심 요약)</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{card.conclusion}</p>
                </div>
              )}
            </div>
          )}

          {/* Like Interaction Area */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
            <span className="font-bold text-slate-700">이 주장글 카드가 마음에 드나요?</span>
            <button
              onClick={() => onToggleLike(card.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold transition shadow-2xs ${
                isLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>공감해요 {card.likesCount > 0 ? card.likesCount : ''}</span>
            </button>
          </div>

          {/* Peer Feedbacks Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>💬 실시간 동료 피드백 ({feedbacks.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">친절하고 따뜻한 한 줄 조언을 남겨주세요</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {/* Quick Tag Selector */}
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    profile
                      ? `${profile.name}님, 동료의 글에 따뜻한 한 줄 피드백을 남겨보세요.`
                      : '학번 및 이름을 먼저 등록한 후 피드백을 남겨주세요.'
                  }
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 text-xs"
                  maxLength={300}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-2xs transition shrink-0 flex items-center space-x-1 disabled:opacity-50 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>전송</span>
                </button>
              </div>

              {errorMsg && <p className="text-[11px] text-rose-600 font-semibold">{errorMsg}</p>}
            </form>

            {/* Peer Feedback List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {feedbacks.length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                  아직 남겨진 피드백이 없습니다. 첫 번째 응원의 한 줄을 남겨보세요! 👏
                </div>
              ) : (
                feedbacks.map((fb) => {
                  const isMyFb = profile?.authorId === fb.authorId;
                  return (
                    <div
                      key={fb.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between space-x-2 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{fb.authorName}</span>
                          <span className="text-[10px] text-slate-400">{fb.studentId}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-md">
                            {fb.category}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{fb.content}</p>
                      </div>

                      {(isMyFb || profile?.isTeacher) && (
                        <button
                          onClick={() => handleDeleteComment(fb.id)}
                          title="삭제하기"
                          className="p-1 text-slate-400 hover:text-rose-500 transition rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-xs shadow-2xs"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
