interface Props {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ name, src, size = 'md', className = '' }: Props) {
  const letter = name?.[0]?.toUpperCase() || '?';

  if (src) {
    return (
      <img src={src} alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white/20 ${className}`} />
    );
  }

  const colors = [
    'from-blue-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-bold text-white border-2 border-white/20 flex-shrink-0 ${className}`}>
      {letter}
    </div>
  );
}
