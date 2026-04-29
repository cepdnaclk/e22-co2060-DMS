import { Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: Props) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizes[size]} text-blue-400 animate-spin`} />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
}
