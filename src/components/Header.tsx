import React from 'react';
import { StudentProfile } from '../types';
import { BookOpen, User, Wifi, WifiOff, ShieldCheck, PenTool } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

interface HeaderProps {
  profile: StudentProfile | null;
  onOpenLoginModal: () => void;
  onToggleTeacher: () => void;
  onScrollToWriter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenLoginModal,
  onToggleTeacher,
  onScrollToWriter,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-extrabold shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-1.5">
                <span>📝</span>
                <span>중3 주장하는 글쓰기 나눔터</span>
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
                국어 수업용
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              서론-본론-결론 개요 작성 및 실시간 동료 피드백 공간
            </p>
          </div>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Connection Badge */}
          <div
            title={isFirebaseConfigured ? "Firestore 실시간 연동 완료" : "로컬 실시간 저장 모드"}
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isFirebaseConfigured
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}
          >
            {isFirebaseConfigured ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Firestore 실시간 연결</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-indigo-500" />
                <span>로컬 동기화 모드</span>
              </>
            )}
          </div>

          {/* Quick Write Button for Mobile */}
          <button
            onClick={onScrollToWriter}
            className="md:hidden flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-indigo-700 transition"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>글쓰기</span>
          </button>

          {/* Student Profile Info Button */}
          {profile ? (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 rounded-xl transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {profile.name ? profile.name.slice(0, 1) : '학'}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800 flex items-center space-x-1">
                  <span>{profile.name}</span>
                  {profile.isTeacher && (
                    <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] rounded-full font-bold">
                      교사
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">{profile.studentId}</div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>학생/교사 등록</span>
            </button>
          )}

          {/* Teacher Mode Toggle */}
          <button
            onClick={onToggleTeacher}
            title="교사 관리 모드 토글 (전체 관리 및 지도 기능)"
            className={`p-2 rounded-xl text-xs font-medium border transition ${
              profile?.isTeacher
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
