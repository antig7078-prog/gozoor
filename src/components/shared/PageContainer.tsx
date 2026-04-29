import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
}

export const PageContainer = ({
  children,
  className = "",
  maxWidth = 'xl',
  noPadding = false
}: PageContainerProps) => {
  const maxWidthMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  };

  return (
    <div className={`min-h-screen ${!noPadding ? 'pb-10 pt-24 sm:pt-28 lg:pt-10 px-4 sm:px-6 lg:px-8' : ''} font-sans ${className}`}>
      <div className={`mx-auto ${maxWidthMap[maxWidth]} animate-in fade-in duration-500`}>
        {children}
      </div>
    </div>
  );
};
