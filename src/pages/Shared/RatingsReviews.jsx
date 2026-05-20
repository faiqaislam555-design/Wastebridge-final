import { useState } from 'react';
import { Star, MessageSquare, Calendar, User, CheckCircle, Send, Award, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RatingsReviews.css';

const RatingsReviews = () => {
  const { currentUser } = useAuth();
  const isOperator = currentUser?.role === 'operator';

  // --- GENERATOR MOCK DATA ---
  const [pendingReviews, setPendingReviews] = useState([
    { id: 101, operator: 'EcoCycle Lahore', date: 'Apr 28, 2026', type: 'Industrial Waste', amount: '500kg' },
    { id: 102, operator: 'BioGas Punjab', date: 'Apr 25, 2026', type: 'Organic Waste', amount: '200kg' }
  ]);

  const [submittedReviews, setSubmittedReviews] = useState([
    { id: 1, operator: 'GreenHaul Co', rating: 5, comment: 'Excellent service! They arrived on time and the staff was very professional.', date: 'Apr 15, 2026', avatar: 'GH' },
    { id: 2, operator: 'CleanPath Services', rating: 4, comment: 'Good overall, but they were a bit late. The pickup was handled well though.', date: 'Apr 10, 2026', avatar: 'CP' }
  ]);

  // --- OPERATOR MOCK DATA ---
  const operatorReviews = [
    { id: 301, author: 'Pearl Continental', rating: 5, comment: 'Reliable and consistent. Best organic waste partner in Lahore.', date: 'Apr 27, 2026', avatar: 'PC' },
    { id: 302, author: 'Green Bites Resto', rating: 5, comment: 'Highly recommended for food scrap collection.', date: 'Apr 20, 2026', avatar: 'GB' },
    { id: 303, author: 'Avari Hotel', rating: 4, comment: 'Good service, sometimes timing varies but always professional.', date: 'Apr 12, 2026', avatar: 'AH' },
  ];

  const stats = {
    avgRating: 4.8,
    totalReviews: 124,
    recommendations: '98%'
  };

  const [activeForm, setActiveForm] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (pickup) => {
    if (rating === 0) return alert('Please select a star rating');
    
    const newReview = {
      id: Date.now(),
      operator: pickup.operator,
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: pickup.operator.substring(0, 2).toUpperCase()
    };

    setSubmittedReviews([newReview, ...submittedReviews]);
    setPendingReviews(pendingReviews.filter(p => p.id !== pickup.id));
    setActiveForm(null);
    setRating(0);
    setComment('');
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`star-icon ${star <= (interactive ? (hoverRating || rating) : count) ? 'filled' : ''}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>{isOperator ? 'Company Reputation' : 'Ratings & Reviews'}</h1>
        <p>{isOperator ? 'See what waste generators are saying about your service.' : 'Share your experience with waste operators to help others.'}</p>
      </div>

      {isOperator ? (
        <>
          {/* OPERATOR VIEW: STATS CARDS */}
          <div className="operator-stats-grid">
             <div className="stat-card-mini">
               <div className="stat-icon-mini"><Award color="#16a34a" /></div>
               <div className="stat-info-mini">
                 <span className="stat-value">{stats.avgRating} / 5.0</span>
                 <span className="stat-label">Average Rating</span>
               </div>
             </div>
             <div className="stat-card-mini">
               <div className="stat-icon-mini"><MessageSquare color="#2563eb" /></div>
               <div className="stat-info-mini">
                 <span className="stat-value">{stats.totalReviews}</span>
                 <span className="stat-label">Total Reviews</span>
               </div>
             </div>
             <div className="stat-card-mini">
               <div className="stat-icon-mini"><Users color="#d97706" /></div>
               <div className="stat-info-mini">
                 <span className="stat-value">{stats.recommendations}</span>
                 <span className="stat-label">Recommendation Rate</span>
               </div>
             </div>
          </div>

          <section className="submitted-section">
            <h2 className="section-title">
              <Star size={20} /> Reviews About You
            </h2>
            <div className="reviews-list">
              {operatorReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-avatar" style={{ background: '#111827' }}>{review.avatar}</div>
                  <div className="review-content">
                    <div className="review-top">
                      <h3>{review.author}</h3>
                      <span className="review-date">{review.date}</span>
                    </div>
                    {renderStars(review.rating)}
                    <p className="review-text">"{review.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* GENERATOR VIEW: PENDING REVIEWS */}
          <section className="pending-section">
            <h2 className="section-title">
              <MessageSquare size={20} /> Pending Reviews
            </h2>
            <div className="pending-grid">
              {pendingReviews.length > 0 ? (
                pendingReviews.map(pickup => (
                  <div key={pickup.id} className={`pending-card ${activeForm === pickup.id ? 'active' : ''}`}>
                    <div className="card-top">
                      <div className="operator-info">
                        <div className="operator-logo">{pickup.operator.substring(0, 2)}</div>
                        <div>
                          <h3>{pickup.operator}</h3>
                          <div className="pickup-details">
                            <span><Calendar size={12} /> {pickup.date}</span>
                            <span>•</span>
                            <span>{pickup.type}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="review-btn"
                        onClick={() => setActiveForm(activeForm === pickup.id ? null : pickup.id)}
                      >
                        {activeForm === pickup.id ? 'Cancel' : 'Leave a Review'}
                      </button>
                    </div>

                    {activeForm === pickup.id && (
                      <div className="review-form">
                        <div className="form-group">
                          <label>How was your experience?</label>
                          {renderStars(0, true)}
                        </div>
                        <div className="form-group">
                          <textarea 
                            placeholder="Write your feedback here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>
                        <button className="submit-review-btn" onClick={() => handleSubmit(pickup)}>
                          <Send size={16} /> Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle size={40} className="text-green-500" />
                  <p>All caught up! No pending reviews.</p>
                </div>
              )}
            </div>
          </section>

          <section className="submitted-section">
            <h2 className="section-title">
              <Star size={20} /> Your Past Reviews
            </h2>
            <div className="reviews-list">
              {submittedReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-avatar">{review.avatar}</div>
                  <div className="review-content">
                    <div className="review-top">
                      <h3>{review.operator}</h3>
                      <span className="review-date">{review.date}</span>
                    </div>
                    {renderStars(review.rating)}
                    <p className="review-text">"{review.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default RatingsReviews;

/* CSS ADDITIONS */
/* You would normally add this to RatingsReviews.css */
/* 
.operator-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}
.stat-card-mini {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon-mini {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}
.stat-info-mini {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}
.stat-label {
  font-size: 13px;
  color: #6b7280;
}
*/
