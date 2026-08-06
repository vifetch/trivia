import React from 'react';
import './QuizResult.css';

function QuizResult({ score, totalQuestions, category, onPlayAgain, onViewHistory }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  let emoji = '😢';
  let message = 'Better luck next time!';
  let color = '#dc3545';
  
  if (percentage >= 90) {
    emoji = '🌟';
    message = 'Excellent!';
    color = '#28a745';
  } else if (percentage >= 70) {
    emoji = '🎉';
    message = 'Great job!';
    color = '#28a745';
  } else if (percentage >= 50) {
    emoji = '👍';
    message = 'Not bad!';
    color = '#ffc107';
  } else if (percentage >= 30) {
    emoji = '📚';
    message = 'Keep trying!';
    color = '#ff9800';
  }

  return (
    <div className="quiz-result">
      <div className="result-header">
        <h2>Quiz Complete!</h2>
      </div>

      <div className="result-content">
        <div className="result-emoji">{emoji}</div>
        
        <div className="result-score">
          <div className="score-number">
            {score} / {totalQuestions}
          </div>
          <div className="score-percentage" style={{ color }}>
            {percentage}%
          </div>
        </div>

        <div className="result-message" style={{ color }}>
          {message}
        </div>

        <div className="result-details">
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{new Date().toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Correct Answers:</span>
            <span className="detail-value">{score}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Incorrect Answers:</span>
            <span className="detail-value">{totalQuestions - score}</span>
          </div>
        </div>

        <div className="result-actions">
          <button onClick={onPlayAgain} className="play-again-btn">
            Play Again
          </button>
          <button onClick={onViewHistory} className="view-history-btn">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizResult;