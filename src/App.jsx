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
  const [errorType, setErrorType] = useState('');
  const [quizHistory, setQuizHistory] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    loadHistory();
    
    // Cleanup timeout on unmount
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
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
      
      if (response.status === 429) {
        handleRateLimit('categories');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data.trivia_categories);
      setError('');
      setErrorType('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please refresh the page.');
      setErrorType('general');
    }
  };

  // Handle rate limiting
  const handleRateLimit = (context) => {
    const rateLimitError = {
      type: 'rate_limit',
      message: 'Too many requests! Please wait a moment before trying again.',
      retryAfter: 5 // seconds
    };
    
    setError(rateLimitError.message);
    setErrorType('rate_limit');
    setIsLoading(false);
    
    // Auto-retry after delay
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
    
    const timeout = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      if (context === 'categories') {
        fetchCategories();
      } else if (context === 'questions') {
        if (selectedCategory) {
          fetchQuestions(selectedCategory);
        }
      }
    }, 5000); // Retry after 5 seconds
    
    setRetryTimeout(timeout);
  };

  // Fetch questions based on selected category
  const fetchQuestions = async (categoryId) => {
    setIsLoading(true);
    setError('');
    setErrorType('');
    setShowHistory(false);
    
    try {
      const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`;
      const response = await fetch(url);
      
      // Handle rate limiting
      if (response.status === 429) {
        handleRateLimit('questions');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.response_code === 0) {
        setQuestions(data.results);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setQuizStarted(true);
        setError('');
        setErrorType('');
        setRetryCount(0);
      } else if (data.response_code === 1) {
        // No results - API doesn't have enough questions
        setError('Not enough questions available for this category. Please try another category.');
        setErrorType('no_results');
      } else if (data.response_code === 2) {
        // Invalid parameter
        setError('Invalid category selected. Please try again.');
        setErrorType('invalid_param');
      } else if (data.response_code === 3) {
        // Session token not found
        setError('Session error. Please try again.');
        setErrorType('session_error');
      } else if (data.response_code === 4) {
        // Session token has returned all questions
        setError('No more questions available. Please try another category.');
        setErrorType('no_results');
      } else {
        setError('Failed to fetch questions. Please try again.');
        setErrorType('general');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please check your connection.');
      setErrorType('general');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    // Reset retry count when user manually selects
    setRetryCount(0);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
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
      // Quiz completed
      finishQuiz();
    }
  };

  // Finish quiz and save results
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
    setError('');
    setErrorType('');
    setRetryCount(0);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  };

  // Start new quiz
  const startNewQuiz = () => {
    setShowResults(false);
    setShowHistory(false);
    setSelectedCategory('');
    setQuestions([]);
    setQuizStarted(false);
    setError('');
    setErrorType('');
    setRetryCount(0);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  };

  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setShowResults(false);
    setQuizStarted(false);
    setError('');
    setErrorType('');
  };

  // Manual retry function
  const handleManualRetry = () => {
    if (errorType === 'rate_limit') {
      setRetryCount(prev => prev + 1);
      if (selectedCategory) {
        fetchQuestions(selectedCategory);
      } else {
        fetchCategories();
      }
    } else {
      // General retry
      if (selectedCategory) {
        fetchQuestions(selectedCategory);
      } else {
        fetchCategories();
      }
    }
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
        {/* Error Display */}
        {error && (
          <div className={`error-message ${errorType}`}>
            <div className="error-content">
              <span className="error-icon">
                {errorType === 'rate_limit' ? '⏳' : 
                 errorType === 'no_results' ? '❌' : '⚠️'}
              </span>
              <span className="error-text">{error}</span>
            </div>
            {errorType === 'rate_limit' && (
              <div className="error-actions">
                <button 
                  onClick={handleManualRetry} 
                  className="retry-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Retrying...' : 'Retry Now'}
                </button>
                {retryCount > 0 && (
                  <span className="retry-count">
                    Retry attempt {retryCount}
                  </span>
                )}
              </div>
            )}
            {errorType === 'general' && (
              <button onClick={handleManualRetry} className="retry-btn">
              Try Again
              </button>
            )}
            {errorType === 'no_results' && (
              <button onClick={startNewQuiz} className="retry-btn">
              Choose Another Category
              </button>
            )}
          </div>
        )}

        {/* Category Selection - Only show when no quiz is active */}
        {!quizStarted && !showResults && !showHistory && !error && (
          <div className="category-select-container">
            <h2>Select a Category</h2>
            <select 
              onChange={handleCategorySelect} 
              value={selectedCategory}
              className="category-select"
              disabled={isLoading}
            >
              <option value="">Choose a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {isLoading && <p className="loading">Loading questions...</p>}
          </div>
        )}

        {/* Quiz Questions */}
        {quizStarted && questions.length > 0 && !showResults && !error && (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            score={score}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {/* Results Screen */}
        {showResults && (
          <QuizResult
            score={score}
            totalQuestions={questions.length}
            category={categories.find(cat => cat.id === parseInt(selectedCategory))?.name || 'Unknown'}
            onPlayAgain={startNewQuiz}
            onViewHistory={toggleHistory}
          />
        )}

        {/* History View */}
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