import React, { useState } from 'react';
import { Model3D, ModelReview } from '../types';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Check, ShieldCheck } from 'lucide-react';

interface RatingReviewSectionProps {
  model: Model3D;
}

export const RatingReviewSection: React.FC<RatingReviewSectionProps> = ({ model }) => {
  const { user, addReview, getReviewsForModel, openAuthModal } = useAuth();
  const reviews = getReviewsForModel(model.id);

  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittedMessage, setSubmittedMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute breakdown
  const totalReviews = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('Please create an account or sign in to submit a rating and community review.');
      return;
    }

    if (!commentInput.trim()) return;

    setIsSubmitting(true);
    const success = addReview(model.id, ratingInput, commentInput.trim());
    setIsSubmitting(false);

    if (success) {
      setCommentInput('');
      setSubmittedMessage('Your review has been verified and posted!');
      setTimeout(() => setSubmittedMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Ratings & Reviews
            <span className="text-sm font-normal text-slate-400">({totalReviews})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Community feedback from 3D artists, game developers, and 3D printing makers.
          </p>
        </div>

        {/* Big Prominent Average Rating Display */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white font-mono leading-none">
              {model.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">out of 5</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(model.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400">{model.reviewsCount} verified ratings</p>
          </div>
        </div>
      </div>

      {/* Rating Breakdown Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Rating Distribution
          </h4>
          {ratingCounts.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-6 font-mono text-slate-400 flex items-center gap-0.5">
                {stars} <Star className="w-3 h-3 fill-amber-400/80 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-slate-400">{count}</span>
            </div>
          ))}
        </div>

        {/* Submit Review Box */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Leave Your Rating
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= (hoverRating || ratingInput)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold ml-1">
                {hoverRating || ratingInput} Star{ (hoverRating || ratingInput) > 1 ? 's' : '' }
              </span>
            </div>

            <textarea
              rows={2}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={
                user
                  ? 'Share your experience with this model (topology, print results, scale, shaders)...'
                  : 'Sign in to write a community review...'
              }
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />

            <div className="flex items-center justify-between">
              {submittedMessage && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {submittedMessage}
                </span>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !commentInput.trim()}
                className="ml-auto px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-sm"
              >
                Post Review
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
            No reviews yet. Be the first to download and review this 3D model!
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {rev.userName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-amber-300 font-semibold ml-1">
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
