import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  message?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 60
};

export const LoadingSpinner = ({ 
  fullPage = false, 
  size = 'md', 
  className = "",
  color = "text-brand-primary",
  message = ""
}: LoadingSpinnerProps) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 
        className={`${color} animate-spin mb-4`} 
        size={pixelSize} 
      />
      {message && <p className="text-text-secondary font-bold">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
