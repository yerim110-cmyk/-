import React from 'react';
import { PRESET_TOPICS } from '../data/presetTopics';
import { TopicPreset } from '../types';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface PresetTopicSelectorProps {
  onSelectTopic: (preset: TopicPreset) => void;
  selectedTopicTitle?: string;
}

export const PresetTopicSelector: React.FC<PresetTopicSelectorProps> = ({
  onSelectTopic,
  selectedTopicTitle,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h3 className="text-xs font-bold text-slate-800">
          💡 중3 국어 추천 논설문 주제선택 (클릭 시 개요 자동 보조)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESET_TOPICS.map((topic) => {
          const isSelected = selectedTopicTitle === topic.title;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic)}
              className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-2xs ring-1 ring-indigo-500'
                  : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {topic.category}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 font-bold" />}
                </div>
                <h4 className="text-xs font-bold leading-snug text-slate-800">{topic.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="mt-2 text-[10px] text-indigo-600 font-semibold flex items-center justify-end">
                <span>주제 적용하기</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
