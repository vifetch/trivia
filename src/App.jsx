import React, { useState, useEffect } from 'react';
import './App.css';
import QuestionCard from './components/QuestionCard';
import QuizResult from './components/QuizResult';
import History from './components/History';

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizHistory, setQuizHistory] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    loadHistory();
  }, []);

  // Load history from localStorage
  const loadHistory = () => {
    const savedHistory = localStorage.getItem('quizHistory');
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory));
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      setCategories(data.trivia_categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please refresh the page.');
    }
  };

  // Fetch questions based on the selected category
  const fetchQuestions = async (categoryId) => {
    setIsLoading(true);
    setError('');
    setShowHistory(false);
    
    try {
      const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.response_code === 0) {
        setQuestions(data.results);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setQuizStarted(true);
      } else {
        setError('Failed to fetch questions. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    if (categoryId) {
      fetchQuestions(categoryId);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  // Finish and save results
  const finishQuiz = () => {
    setShowResults(true);
    setQuizStarted(false);
    
    const categoryName = categories.find(
      cat => cat.id === parseInt(selectedCategory)
    )?.name || 'Unknown Category';
    
    const result = {
      id: Date.now(),
      category: categoryName,
      score: score,
      total: questions.length,
      date: new Date().toLocaleString(),
      percentage: Math.round((score / questions.length) * 100)
    };
    
    // Save to localStorage
    const updatedHistory = [...quizHistory, result];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setQuizStarted(false);
    setSelectedCategory('');
    setShowHistory(false);
  };

  // Start new quiz
  const startNewQuiz = () => {
    setShowResults(false);
    setShowHistory(false);
    setSelectedCategory('');
    setQuestions([]);
    setQuizStarted(false);
  };

  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setShowResults(false);
    setQuizStarted(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trivia</h1>
        <p>Powered by opentdb.com</p>
        <div className="header-buttons">
          {!showResults && !quizStarted && !showHistory && (
            <button onClick={toggleHistory} className="history-btn">
              View History
            </button>
          )}
          {showHistory && (
            <button onClick={startNewQuiz} className="back-btn">
              ← Back to Quiz
            </button>
          )}
          {(quizStarted || showResults) && (
            <button onClick={resetQuiz} className="reset-btn">
              ↺ New Quiz
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}
        //  Category Selection - Only show when no quiz active 
        {!quizStarted && !showResults && !showHistory && (
          <div className="category-select-container">
            <h2>Select a Category to be Quizzed on...</h2>
            <select 
              onChange={handleCategorySelect} 
              value={selectedCategory}
              className="category-select">
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {isLoading && <p className="loading">Loading questions</p>}
          </div>
        )}

        // Quiz Questions
        {quizStarted && questions.length > 0 && !showResults && (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={handleNextQuestion}
          />
        )}

        // Results Screen
        {showResults && (
          <QuizResult
            score={score}
            totalQuestions={questions.length}
            category={categories.find(cat => cat.id === parseInt(selectedCategory))?.name || 'Unknown'}
            onPlayAgain={startNewQuiz}
            onViewHistory={toggleHistory}
          />
        )}

        // History View
        {showHistory && (
          <History 
            history={quizHistory}
            onClearHistory={() => {
              localStorage.removeItem('quizHistory');
              setQuizHistory([]);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;