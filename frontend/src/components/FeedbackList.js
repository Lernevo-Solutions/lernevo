import React, { useState, useEffect } from 'react';
import './FeedbackList.css';
import api from '../api';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

 const fetchFeedbacks = async () => {
  try {
    setLoading(true);
    setError(null);
    // ✅ GET from /feedback/
    const response = await api.get('/feedback/list/');
    console.log("Feedbacks response:", response.data);
    setFeedbacks(response.data);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    console.error('Response:', err.response?.data);
    setError('Failed to load feedbacks. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const getRatingEmoji = (rating) => {
    const emojis = {
      1: '😞',
      2: '😐',
      3: '🙂',
      4: '😊',
      5: '🤩'
    };
    return emojis[rating] || '⭐';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Great',
      5: 'Excellent'
    };
    return labels[rating] || '';
  };

  const getFilteredFeedbacks = () => {
    let filtered = [...feedbacks];
    
    if (filter === 'high') {
      filtered = filtered.filter(f => f.rating >= 4);
    } else if (filter === 'low') {
      filtered = filtered.filter(f => f.rating <= 2);
    } else if (filter === 'medium') {
      filtered = filtered.filter(f => f.rating === 3);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-header">
        <h1 className="feedback-list-title">📋 Feedback Management</h1>
        <p className="feedback-list-subtitle">View and manage all user feedback submissions</p>
      </div>

      {error && (
        <div className="feedback-list-error">
          ⚠️ {error}
          <button onClick={fetchFeedbacks} className="feedback-retry-btn">Retry</button>
        </div>
      )}

      <div className="feedback-list-controls">
        <div className="feedback-list-filters">
          <label>Filter by Rating:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="feedback-filter-select">
            <option value="all">All Ratings</option>
            <option value="high">High (4-5 ⭐)</option>
            <option value="medium">Medium (3 ⭐)</option>
            <option value="low">Low (1-2 ⭐)</option>
          </select>
        </div>

        <div className="feedback-list-sort">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="feedback-sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        <div className="feedback-list-stats">
          <span>Total: {feedbacks.length}</span>
          <span>Showing: {filteredFeedbacks.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="feedback-list-loading">
          <div className="feedback-list-spinner"></div>
          <p>Loading feedbacks...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="feedback-list-empty">
          <span className="empty-icon">📭</span>
          <h3>No feedbacks found</h3>
          <p>There are no feedback submissions to display.</p>
        </div>
      ) : (
        <div className="feedback-table-wrapper">
          <table className="feedback-list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Liked</th>
                <th>Improve</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback, index) => (
                <tr key={feedback.id || index} className="feedback-row">
                  <td className="feedback-row-number">{index + 1}</td>
                  <td className="feedback-user-cell">
                    <div className="feedback-user-info">
                      <span className="feedback-user-name">
                        {feedback.user_name || feedback.username || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="feedback-email-cell">
                    <span className="feedback-email">
                      {feedback.email || feedback.user_email || 'N/A'}
                    </span>
                  </td>
                  <td className="feedback-rating-cell">
                    <div className="feedback-rating-display">
                      <span className="feedback-rating-emoji">{getRatingEmoji(feedback.rating)}</span>
                      <span className="feedback-rating-value">{feedback.rating}/5</span>
                      <span className="feedback-rating-label">({getRatingLabel(feedback.rating)})</span>
                    </div>
                    <div className="feedback-rating-bar">
                      <div 
                        className="feedback-rating-bar-fill"
                        style={{ 
                          width: `${(feedback.rating / 5) * 100}%`,
                          background: `linear-gradient(90deg, #f59e0b, ${feedback.rating >= 4 ? '#10b981' : feedback.rating >= 3 ? '#f59e0b' : '#ef4444'})`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="feedback-liked-cell">
                    <div className="feedback-text-preview">
                      {feedback.liked ? (
                        <span className="feedback-text-content">{truncateText(feedback.liked, 80)}</span>
                      ) : (
                        <span className="feedback-empty-text">—</span>
                      )}
                    </div>
                  </td>
                  <td className="feedback-improve-cell">
                    <div className="feedback-text-preview">
                      {feedback.improve ? (
                        <span className="feedback-text-content">{truncateText(feedback.improve, 80)}</span>
                      ) : (
                        <span className="feedback-empty-text">—</span>
                      )}
                    </div>
                  </td>
                  <td className="feedback-date-cell">
                    <span className="feedback-date">{formatDate(feedback.submitted_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredFeedbacks.length > 0 && (
        <div className="feedback-list-footer">
          <button className="feedback-export-btn" onClick={() => window.print()}>
            🖨️ Export / Print
          </button>
          <button className="feedback-refresh-btn" onClick={fetchFeedbacks}>
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
}