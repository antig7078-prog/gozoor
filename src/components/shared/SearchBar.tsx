import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "ابحث...",
  showFilter = true,
  onFilterClick,
  className = ""
}: SearchBarProps) => {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 w-full ${className}`}>
      <div className="relative flex-1 md:max-w-md lg:max-w-lg group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          aria-label="بحث"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-3.5 bg-white border border-border-default rounded-[var(--radius-input)] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-slate-900 shadow-sm text-sm sm:text-base"
        />
      </div>
      {showFilter && (
        <button 
          onClick={onFilterClick}
          aria-label="تصفية النتائج"
          className="p-3 sm:p-3.5 bg-white border border-border-default text-slate-600 rounded-[var(--radius-button)] hover:bg-slate-50 hover:text-brand-primary transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
};
