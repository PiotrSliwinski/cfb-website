import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <div key={i} className="relative">
            {isPartial ? (
              <>
                {/* Background empty star */}
                <Star
                  className={`${sizeClasses[size]} text-gray-300`}
                  fill="currentColor"
                />
                {/* Foreground partial star */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating % 1) * 100}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400`}
                    fill="currentColor"
                  />
                </div>
              </>
            ) : (
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
              />
            )}
          </div>
        );
      })}
      {showNumber && (
        <span className={`ml-1 font-medium text-gray-700 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
