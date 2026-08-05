import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { UserCheck, ShieldAlert, X, Sparkles, CheckCircle } from 'lucide-react';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile | null;
  onSaveProfile: (profile: StudentProfile) => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [studentId, setStudentId] = useState(currentProfile?.studentId || '3학년 1반 ');
  const [name, setName] = useState(currentProfile?.name || '');
  const [isTeacher, setIsTeacher] = useState(currentProfile?.isTeacher || false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMsg('학번(예: 3학년 1반 05번)을 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('이름 또는 닉네임을 입력해 주세요.');
      return;
    }

    // Privacy check warning for sensitive numbers
    if (/\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(name) || /\d{6}[-.\s]?[1-4]\d{6}/.test(name)) {
      setErrorMsg('전화번호나 주민등록번호 등 개인정보는 작성하지 말아주세요!');
      return;
    }

    const updatedProfile: StudentProfile = {
      studentId: studentId.trim(),
      name: name.trim(),
      authorId: currentProfile?.authorId || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isTeacher,
    };

    onSaveProfile(updatedProfile);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800">학생 / 교사 정보 등록</h2>
            <p className="text-xs text-slate-500">주장글 제출 및 동료 피드백에 표시될 학번과 이름입니다.</p>
          </div>
        </div>

        {/* Privacy Guard Notice */}
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            🔒 <strong className="font-bold">개인정보 보호 안내:</strong> 전화번호, 주민등록번호, 주소 등 과도한 개인정보는 절대 작성하지 마세요. 학번과 이름(또는 닉네임)만 사용합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              학번 및 반 번호 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예: 3학년 1반 05번 또는 30105"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              이름 또는 닉네임 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김국어 또는 논리왕3"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition"
              maxLength={30}
            />
          </div>

          {/* Teacher check option */}
          <div className="pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isTeacher}
                onChange={(e) => setIsTeacher(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>국어 선생님(교사 지도 모드 사용)</span>
            </label>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>정보 저장 후 시작</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
