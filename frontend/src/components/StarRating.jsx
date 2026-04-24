import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating = 0, size = 16, editable = false, onRate }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          onClick={() => editable && onRate && onRate(star)}
          className={`transition-colors ${
            star <= rating ? 'text-amber-400 fill-current' : 'text-slate-600'
          } ${editable ? 'cursor-pointer hover:text-amber-300' : ''}`}
        />
      ))}
    </div>
  );
}
