import React from 'react';
import './History.css';

function History({ history, onClearHistory }) {
  if (history.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">📭</div>
        <h3>No Quiz History Yet</h3>
        <p>Take a quiz to see your results here</p>
      </div>
    );
  }

  // Sort by newest
  const sortedHistory = [...history].reverse();

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Quiz History</h2>
        <button onClick={onClearHistory} className="clear-history-btn">
          Clear All
        </button>
      </div>

      <div className="history-list">
        {sortedHistory.map((result, index) => (
          <div key={result.id || index} className="history-item">
            <div className="history-item-header">
              <span className="history-category">{result.category}</span>
              <span className={`history-score ${result.percentage >= 70 ? 'high-score' : result.percentage >= 50 ? 'medium-score' : 'low-score'}`}>
                {result.score}/{result.total}
              </span>
            </div>
            <div className="history-item-details">
              <span className="history-date">{result.date}</span>
              <span className="history-percentage">
                {result.percentage}%
              </span>
            </div>
            <div className="history-progress-bar">
              <div 
                className="history-progress-fill"
                style={{ 
                  width: `${result.percentage}%`,
                  background: result.percentage >= 70 ? '#28a745' : 
                             result.percentage >= 50 ? '#ffc107' : '#dc3545'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="history-stats">
        <div className="stat-item">
          <span className="stat-label">Total Quizzes</span>
          <span className="stat-value">{history.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">
            {Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / history.length)}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best Score</span>
          <span className="stat-value">
            {Math.max(...history.map(h => h.percentage))}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default History;