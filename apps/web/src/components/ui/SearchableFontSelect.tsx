import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { TOP_FONTS, FontInfo } from '../../data/fonts';

interface SearchableFontSelectProps {
  label?: string;
  value: string;
  onChange: (fontName: string) => void;
  className?: string;
  placeholder?: string;
  helpText?: string;
}

export const SearchableFontSelect: React.FC<SearchableFontSelectProps> = ({
  label,
  value,
  onChange,
  className = '',
  placeholder = 'Select a font family...',
  helpText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Find currently selected font info
  const selectedFontInfo: FontInfo | undefined = useMemo(() => {
    return TOP_FONTS.find((f) => f.name.toLowerCase() === (value || '').toLowerCase()) || {
      name: value || 'Times New Roman',
      category: 'Serif (Academic)',
    };
  }, [value]);

  // Filtered fonts based on category and search query
  const filteredFonts = useMemo(() => {
    let list = TOP_FONTS;

    if (selectedCategory === 'TOP') {
      list = list.filter((f) => f.isTopAcademic);
    } else if (selectedCategory === 'SERIF') {
      list = list.filter((f) => f.category === 'Serif (Academic)');
    } else if (selectedCategory === 'SANS') {
      list = list.filter((f) => f.category === 'Sans-Serif (Modern)');
    } else if (selectedCategory === 'MONO') {
      list = list.filter((f) => f.category === 'Monospace (Technical)');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.recommendedFor && f.recommendedFor.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const handleSelect = (fontName: string) => {
    onChange(fontName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left bg-white border rounded-lg shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-sm font-bold text-slate-900 truncate"
            style={{ fontFamily: selectedFontInfo?.name }}
          >
            {selectedFontInfo?.name || placeholder}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
            {selectedFontInfo?.category.split(' ')[0]}
          </span>
          <span
            className="hidden md:inline-block text-xs text-slate-400 italic truncate"
            style={{ fontFamily: selectedFontInfo?.name }}
          >
            Aa Bb Gg 123
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {helpText && <p className="text-[11px] text-slate-500 mt-1">{helpText}</p>}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 text-xs animate-fadeIn">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 115+ fonts by name or style (e.g. Garamond, APA, Code)..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 border-b border-slate-100 scrollbar-none">
            {[
              { id: 'ALL', label: 'All (117)' },
              { id: 'TOP', label: 'Top Academic (28)', icon: Sparkles },
              { id: 'SERIF', label: 'Serif (42)' },
              { id: 'SANS', label: 'Sans-Serif (52)' },
              { id: 'MONO', label: 'Monospace (17)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.icon && <cat.icon className="w-3 h-3 text-amber-300" />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Font Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 divide-y divide-slate-50 pr-1">
            {filteredFonts.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No matching fonts found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredFonts.map((font) => {
                const isSelected = (value || '').toLowerCase() === font.name.toLowerCase();
                return (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => handleSelect(font.name)}
                    className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200/60'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold text-slate-900"
                          style={{ fontFamily: font.name }}
                        >
                          {font.name}
                        </span>
                        {font.isTopAcademic && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            Academic
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {font.category.split(' ')[0]}
                        </span>
                      </div>

                      {font.recommendedFor && (
                        <p className="text-[10.5px] text-slate-500 truncate max-w-sm">
                          {font.recommendedFor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs text-slate-400 hidden sm:inline select-none"
                        style={{ fontFamily: font.name }}
                      >
                        Aa Bb Gg
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Apply Helper Footer */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Showing {filteredFonts.length} of {TOP_FONTS.length} styles</span>
            <span className="font-medium text-indigo-600">OpenXML Standard</span>
          </div>
        </div>
      )}
    </div>
  );
};
