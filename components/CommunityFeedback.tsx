import React, { useState, useMemo } from 'react';
import { RecipeDetail, Comment } from '../types';
import { StarRating } from './StarRating';

interface CommunityFeedbackProps {
  title: string;
  recipeDetail: RecipeDetail;
  onFeedbackSubmit: (feedback: { rating: number; comment: string }) => void;
}

export const CommunityFeedback: React.FC<CommunityFeedbackProps> = ({ title, recipeDetail, onFeedbackSubmit }) => {
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageRating = useMemo(() => {
    if (!recipeDetail.ratings || recipeDetail.ratings.length === 0) return 0;
    const sum = recipeDetail.ratings.reduce((a, b) => a + b, 0);
    return sum / recipeDetail.ratings.length;
  }, [recipeDetail.ratings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0 && userComment.trim() === '') return;
    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
        onFeedbackSubmit({ rating: userRating, comment: userComment.trim() });
        setUserRating(0);
        setUserComment('');
        setIsSubmitting(false);
    }, 500);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-300">{title}</h3>
      
      <div className="mb-6 bg-gray-900/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">
            Average Rating: {averageRating.toFixed(1)} / 5 
            ({recipeDetail.ratings.length} vote{recipeDetail.ratings.length !== 1 ? 's' : ''})
        </p>
        <div className="flex justify-center mt-2">
            <StarRating rating={averageRating} size="md" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <h4 className="font-semibold text-lg mb-2 text-gray-300">Leave your feedback</h4>
        <div className="mb-3 flex justify-center">
            <StarRating rating={userRating} onRatingChange={setUserRating} size="lg" />
        </div>
        <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Share your thoughts or tips..."
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow resize-none mb-3"
        />
        <button
            type="submit"
            disabled={isSubmitting || (userRating === 0 && userComment.trim() === '')}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
      
      <div>
        <h4 className="font-semibold text-lg mb-3 text-gray-300">Comments ({recipeDetail.comments.length})</h4>
        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            {recipeDetail.comments.length > 0 ? (
                [...recipeDetail.comments].reverse().map((comment, index) => (
                    <div key={index} className="bg-gray-900/50 p-3 rounded-lg">
                        <p className="text-gray-300">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1 text-right">{new Date(comment.date).toLocaleString()}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
            )}
        </div>
      </div>
    </div>
  );
};
