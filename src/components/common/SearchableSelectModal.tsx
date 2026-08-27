import React, { useState, useMemo } from 'react';
import { Search, X, Check, PlusCircle, Building2, BookOpen, GraduationCap } from 'lucide-react';

export interface SelectOption {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
}

interface SearchableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  options: SelectOption[];
  selectedValue?: string | null;
  customValue?: string | null;
  onSelect: (option: { id: string | null; name: string; isCustom: boolean }) => void;
  allowOther?: boolean;
  type?: 'university' | 'faculty' | 'department' | 'course' | 'subject';
}

export const SearchableSelectModal: React.FC<SearchableSelectModalProps> = ({
  isOpen,
  onClose,
  title,
  placeholder = 'Search...',
  options,
  selectedValue,
  customValue,
  onSelect,
  allowOther = true,
  type = 'university',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTypingCustom, setIsTypingCustom] = useState(false);
  const [customInputText, setCustomInputText] = useState(customValue || '');

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(
      opt =>
        opt.name.toLowerCase().includes(q) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(q))
    );
  }, [options, searchTerm]);

  if (!isOpen) return null;

  const handleSelectOption = (opt: SelectOption) => {
    onSelect({ id: opt.id, name: opt.name, isCustom: false });
    onClose();
  };

  const handleConfirmCustom = () => {
    if (!customInputText.trim()) return;
    onSelect({ id: null, name: customInputText.trim(), isCustom: true });
    setIsTypingCustom(false);
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'university':
        return <Building2 className="w-5 h-5 text-[#FF6A00]" />;
      case 'faculty':
      case 'department':
        return <GraduationCap className="w-5 h-5 text-[#FF6A00]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#FF6A00]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-[#0b0f19]/90 backdrop-blur-2xl border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF6A00]/15 border border-[#FF6A00]/30 backdrop-blur-md text-[#FF7A1A]">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">
                {options.length} options available in official registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-xl text-white placeholder-slate-500 outline-none backdrop-blur-md transition-all"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isTypingCustom ? (
            <div className="p-5 bg-white/[0.05] backdrop-blur-xl border border-[#FF6A00]/40 rounded-2xl space-y-3 m-1 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FFA05C]">
                <PlusCircle className="w-4 h-4" />
                <span>Enter custom {type}:</span>
              </div>
              <input
                type="text"
                value={customInputText}
                onChange={e => setCustomInputText(e.target.value)}
                placeholder={`e.g., My Institution / ${type}`}
                className="w-full px-4 py-2.5 text-sm bg-white/[0.05] border border-white/20 focus:border-[#FF6A00] rounded-xl text-white outline-none backdrop-blur-md"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmCustom();
                }}
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This will be stored in your personalized academic profile and surfaced to moderators to grow the official registry.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsTypingCustom(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCustom}
                  disabled={!customInputText.trim()}
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white rounded-xl shadow-md shadow-[#FF6A00]/25 transition-all disabled:opacity-50"
                >
                  Save Custom Entry
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredOptions.map(opt => {
                const isSelected = selectedValue === opt.id || (!selectedValue && customValue === opt.name);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#FF6A00]/20 border border-[#FF6A00]/50 text-white backdrop-blur-md shadow-md shadow-[#FF6A00]/10'
                        : 'hover:bg-white/[0.06] border border-transparent text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate text-white">{opt.name}</div>
                      {opt.subtitle && (
                        <div className="text-xs text-slate-400 truncate">{opt.subtitle}</div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#FF6A00] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#FF6A00]/40">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredOptions.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No registered {type} matched "{searchTerm}".
                </div>
              )}

              {/* Other / Not Listed Item */}
              {allowOther && (
                <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={() => setIsTypingCustom(true)}
                    className="w-full text-left p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/[0.06] text-[#FFA05C] border border-dashed border-[#FF6A00]/40 backdrop-blur-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Other / Not Listed</div>
                      <div className="text-xs text-slate-400">
                        Can't find your {type}? Type custom name.
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
