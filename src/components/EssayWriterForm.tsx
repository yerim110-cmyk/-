import React, { useState } from 'react';
import { StudentProfile, EssayCard, TopicPreset, AiFeedbackResult } from '../types';
import { PresetTopicSelector } from './PresetTopicSelector';
import {
  FileText,
  Send,
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';

interface EssayWriterFormProps {
  profile: StudentProfile | null;
  onRequireProfile: () => void;
  onSubmitSuccess: (cardId: string) => void;
  editingCard?: EssayCard | null;
  onCancelEdit?: () => void;
}

export const EssayWriterForm: React.FC<EssayWriterFormProps> = ({
  profile,
  onRequireProfile,
  onSubmitSuccess,
  editingCard,
  onCancelEdit,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [topic, setTopic] = useState(editingCard?.topic || '');
  const [claim, setClaim] = useState(editingCard?.claim || '');
  const [reason1, setReason1] = useState(editingCard?.reason1 || '');
  const [reason2, setReason2] = useState(editingCard?.reason2 || '');
  const [reason3, setReason3] = useState(editingCard?.reason3 || '');
  const [introduction, setIntroduction] = useState(editingCard?.introduction || '');
  const [body, setBody] = useState(editingCard?.body || '');
  const [conclusion, setConclusion] = useState(editingCard?.conclusion || '');

  // AI Feedback state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiFeedbackResult | null>(null);
  const [aiError, setAiError] = useState('');

  // General error state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Preset selection
  const handleSelectPreset = (preset: TopicPreset) => {
    setTopic(preset.title);
    if (preset.sampleClaim) setClaim(preset.sampleClaim);
    if (preset.sampleReasons && preset.sampleReasons.length >= 3) {
      setReason1(preset.sampleReasons[0]);
      setReason2(preset.sampleReasons[1]);
      setReason3(preset.sampleReasons[2]);
    }
    setErrorMsg('');
  };

  // Trigger AI Feedback from express backend
  const handleFetchAiFeedback = async () => {
    if (!topic || !claim) {
      setAiError('주제와 주장을 먼저 작성해야 AI 피드백을 받을 수 있습니다.');
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiResult(null);

    try {
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          claim,
          reason1,
          reason2,
          reason3,
          introduction,
          body,
          conclusion,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI 피드백 요청 중 오류가 발생했습니다.');
      }

      setAiResult(data.feedback);
    } catch (err: any) {
      setAiError(err.message || 'AI 피드백 서비스 연결에 실패했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Essay Card
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      onRequireProfile();
      return;
    }

    // Validation
    if (!topic.trim()) {
      setErrorMsg('글의 주제를 입력하세요.');
      setActiveStep(1);
      return;
    }
    if (!claim.trim()) {
      setErrorMsg('나의 주장을 입력하세요.');
      setActiveStep(1);
      return;
    }
    if (!reason1.trim()) {
      setErrorMsg('주장을 뒷받침할 최소 1개 이상의 근거를 입력하세요.');
      setActiveStep(2);
      return;
    }

    // Character length validation (max 1000 per section)
    if (
      topic.length > 100 ||
      claim.length > 300 ||
      reason1.length > 500 ||
      reason2.length > 500 ||
      reason3.length > 500 ||
      introduction.length > 1000 ||
      body.length > 1000 ||
      conclusion.length > 1000
    ) {
      setErrorMsg('각 입력란의 최대 글자 수(1000자 이내)를 초과했습니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { addEssayCard, updateEssayCard } = await import('../services/essayService');

      if (editingCard) {
        await updateEssayCard(
          editingCard.id,
          {
            topic: topic.trim(),
            claim: claim.trim(),
            reason1: reason1.trim(),
            reason2: reason2.trim(),
            reason3: reason3.trim(),
            introduction: introduction.trim(),
            body: body.trim(),
            conclusion: conclusion.trim(),
            authorName: profile.name,
            studentId: profile.studentId,
          },
          profile.authorId
        );
        onSubmitSuccess(editingCard.id);
      } else {
        const newCardId = await addEssayCard({
          topic: topic.trim(),
          claim: claim.trim(),
          reason1: reason1.trim(),
          reason2: reason2.trim(),
          reason3: reason3.trim(),
          introduction: introduction.trim(),
          body: body.trim(),
          conclusion: conclusion.trim(),
          authorName: profile.name,
          studentId: profile.studentId,
          authorId: profile.authorId,
        });
        onSubmitSuccess(newCardId);

        // Reset form for new submission
        setTopic('');
        setClaim('');
        setReason1('');
        setReason2('');
        setReason3('');
        setIntroduction('');
        setBody('');
        setConclusion('');
        setAiResult(null);
        setActiveStep(1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '카드 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      
      {/* Header section */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {editingCard ? '✏️ 주장글 개요 카드 수정하기' : '📝 내 글 작성하기'}
            </h2>
            <p className="text-xs text-slate-500">
              주제와 주장, 근거 3가지 및 서론-본론-결론을 차례대로 정리해보세요.
            </p>
          </div>
        </div>

        {editingCard && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl font-medium transition"
          >
            수정 취소
          </button>
        )}
      </div>

      {/* Author Indicator */}
      <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">작성자:</span>
          {profile ? (
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {profile.studentId} {profile.name}
            </span>
          ) : (
            <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
              학번/이름 미등록 (제출 시 등록 요청)
            </span>
          )}
        </div>
        {!profile && (
          <button
            type="button"
            onClick={onRequireProfile}
            className="text-[11px] font-bold text-indigo-600 underline hover:text-indigo-800"
          >
            내 학번 등록하기
          </button>
        )}
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`py-2 px-1 text-center rounded-lg transition ${
            activeStep === 1
              ? 'bg-indigo-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. 주제 & 주장
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`py-2 px-1 text-center rounded-lg transition ${
            activeStep === 2
              ? 'bg-indigo-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. 근거 3가지
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`py-2 px-1 text-center rounded-lg transition ${
            activeStep === 3
              ? 'bg-indigo-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. 서-본-결 작성
        </button>
        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className={`py-2 px-1 text-center rounded-lg transition flex items-center justify-center space-x-1 ${
            activeStep === 4
              ? 'bg-indigo-600 text-white font-bold shadow-2xs'
              : 'text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <Bot className="w-3.5 h-3.5 hidden sm:inline-block" />
          <span>4. AI 피드백</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* STEP 1: Topic & Claim */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Preset Topic Selection Accordion */}
            <PresetTopicSelector
              onSelectTopic={handleSelectPreset}
              selectedTopicTitle={topic}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                글의 주제 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 교복 자율화, 급식 메뉴 선택권"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition"
                maxLength={100}
              />
              <div className="text-[10px] text-right text-slate-400 mt-0.5">
                {topic.length} / 100자
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                나의 주장 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="핵심 주장을 한 문장으로 적으세요."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={300}
              />
              <div className="text-[10px] text-right text-slate-400 mt-0.5">
                {claim.length} / 300자
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!topic.trim() || !claim.trim()) {
                    setErrorMsg('주제와 주장을 먼저 입력해주세요.');
                    return;
                  }
                  setErrorMsg('');
                  setActiveStep(2);
                }}
                className="flex items-center space-x-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
              >
                <span>다음: 근거 세 가지 작성</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 3 Reasons */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl text-xs text-indigo-900 mb-2">
              💡 <strong>근거 작성 팁:</strong> 타당한 근거는 주장을 단단하게 지지합니다. 사실, 통계, 전문가 의견, 구체적 사례 등을 포함해 보세요.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                근거 세 가지 (요약) - 근거 1 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason1}
                onChange={(e) => setReason1(e.target.value)}
                placeholder="첫째, ..."
                rows={2}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                근거 2 (선택 권장)
              </label>
              <textarea
                value={reason2}
                onChange={(e) => setReason2(e.target.value)}
                placeholder="둘째, ..."
                rows={2}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                근거 3 (선택 권장)
              </label>
              <textarea
                value={reason3}
                onChange={(e) => setReason3(e.target.value)}
                placeholder="셋째, ..."
                rows={2}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={500}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 단계</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!reason1.trim()) {
                    setErrorMsg('근거 1은 필수 항목입니다.');
                    return;
                  }
                  setErrorMsg('');
                  setActiveStep(3);
                }}
                className="flex items-center space-x-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
              >
                <span>다음: 서론-본론-결론 작성</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Introduction - Body - Conclusion */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl text-xs text-pink-950 mb-2">
              📖 <strong>서론 - 본론 - 결론 요약:</strong> 전체적인 글의 흐름을 정리해 보세요.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                서론 (문제 제기 및 배경)
              </label>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder="글을 시작하며 읽는 이의 흥미를 유발할 문제 상황이나 질문을 적으세요."
                rows={3}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                본론 (주장 및 근거 구체화)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="첫째, 둘째, 셋째 담화 표지를 활용하여 근거들을 상세히 연결하여 적으세요."
                rows={4}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                결론 (핵심 요약 및 당부)
              </label>
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="나의 주장을 재확인하고 독자들에게 마지막으로 당부하고 싶은 말을 마무리하세요."
                rows={3}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
                maxLength={1000}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 단계</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="flex items-center space-x-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
              >
                <Bot className="w-4 h-4" />
                <span>AI 국어선생님 피드백 단계로</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AI Feedback & Submit */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800">
                    🤖 AI 국어선생님의 1:1 글쓰기 피드백
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleFetchAiFeedback}
                  disabled={isAiLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <span>분석 중...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>피드백 요청하기</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                작성한 주장과 근거, 서론-본론-결론의 논리적 흐름을 AI가 분석하여 칭찬과 보완점을 제시해줍니다.
              </p>

              {aiError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl mt-3 border border-rose-200">
                  ⚠️ {aiError}
                </p>
              )}

              {aiResult && (
                <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">📊 논설문 완성도:</span>
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                      {aiResult.scoreRating}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-emerald-800 mb-1">👏 칭찬 메시지:</h4>
                    <p className="text-slate-700 leading-relaxed bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      {aiResult.praise}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-indigo-800 mb-1">💡 근거 분석 조언:</h4>
                    <p className="text-slate-700 leading-relaxed bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                      {aiResult.evidenceFeedback}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-800 mb-1">📖 3단 구성 조언:</h4>
                    <p className="text-slate-700 leading-relaxed bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                      {aiResult.structureFeedback}
                    </p>
                  </div>

                  {aiResult.recommendedComments && aiResult.recommendedComments.length > 0 && (
                    <div>
                      <h4 className="font-bold text-purple-800 mb-1">💬 친구들이 남길만한 추천 댓글 예시:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                        {aiResult.recommendedComments.map((comment, idx) => (
                          <li key={idx}>{comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Card Preview Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">
                👀 제출될 개요 카드 미리보기
              </span>
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 text-[11px] font-semibold">
                  <span>작성자: {profile?.studentId || ''} {profile?.name || '익명'}</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">새 글</span>
                </div>
                <div className="font-extrabold text-slate-800 text-sm">주제: {topic || '(주제 미입력)'}</div>
                <div className="p-2.5 bg-pink-50 border-l-3 border-pink-400 rounded-lg text-slate-800 font-semibold">
                  {claim || '(주장 미입력)'}
                </div>
                <div className="space-y-1 text-slate-700">
                  <div className="flex items-start gap-1">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{reason1 || '(근거 1 미입력)'}</span>
                  </div>
                  {reason2 && (
                    <div className="flex items-start gap-1">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{reason2}</span>
                    </div>
                  )}
                  {reason3 && (
                    <div className="flex items-start gap-1">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{reason3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="flex items-center space-x-1 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 단계</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-2xs transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{editingCard ? '개요 카드 수정 완료' : '개요 카드 완성 및 제출하기 ✨'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Warning Box */}
        <div className="text-[11px] text-slate-400 text-center pt-2">
          ⚠️ 전화번호, 주소 등 과도한 개인정보를 적지 마세요.
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

      </form>
    </div>
  );
};
