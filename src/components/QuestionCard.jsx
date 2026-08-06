import React, { useState, useEffect } from 'react';
import './QuestionCard.css';

function QuestionCard({ 
  question, 
  currentIndex, 
  totalQuestions, 
  score, 
  onAnswerSelect, 
  onNextQuestion 
}) {
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Shuffle answers when question changes
  useEffect(() => {
    if (question) {
      const answers = [...question.incorrect_answers, question.correct_answer];
      const shuffled = shuffleArray(answers);
      setShuffledAnswers(shuffled);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  }, [question]);

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Handle answer click
  const handleAnswerClick = (answer) => {
    if (isAnswered) return;
    
    const correct = answer === question.correct_answer;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setIsCorrect(correct);
    
    // Notify parent component
    onAnswerSelect(correct);
  };

  // Get button class based on answer state
  const getButtonClass = (answer) => {
    if (!isAnswered) return 'answer-btn';
    if (answer === question.correct_answer) return 'answer-btn correct';
    if (answer === selectedAnswer && !isCorrect) return 'answer-btn incorrect';
    return 'answer-btn disabled';
  };

  // Decode HTML entities in text
  const decodeHtml = (text) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    return txt.value;
  };

  if (!question) return null;

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-progress">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <div className="question-score">
          Score: {score} / {totalQuestions}
        </div>
      </div>

      <div className="question-category">
        Category: {decodeHtml(question.category)}
      </div>

      <div className="question-difficulty">
        Difficulty: <span className={`difficulty-${question.difficulty}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>

      <h3 className="question-text">
        {decodeHtml(question.question)}
      </h3>

      <div className="answers-container">
        {shuffledAnswers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClass(answer)}
            onClick={() => handleAnswerClick(answer)}
            disabled={isAnswered}
          >
            {decodeHtml(answer)}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="feedback-container">
          <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
            {isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${decodeHtml(question.correct_answer)}`}
          </div>
          <button onClick={onNextQuestion} className="next-btn">
            {currentIndex === totalQuestions - 1 ? 'See Results' : 'Next Question ->'}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;