import React, { useState } from 'react';
import './App.css';
import LetterFront from './components/LetterFront';
import LetterBack from './components/LetterBack';
import HomePage from './components/HomePage';
import SubPage from './components/SubPage';

function App() {
  const [currentView, setCurrentView] = useState('front'); // front, back, home, subpage
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);

  const handlePhoneSubmit = (phone) => {
    setPhoneNumber(phone);
    setCurrentView('back');
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setCurrentView('home');
  };

  const handleAnswerSelect = (answer, nextQuestion = null) => {
    if (nextQuestion) {
      setQuestionHistory([...questionHistory, currentQuestion]);
      setCurrentQuestion(nextQuestion);
      setCurrentView('subpage');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentQuestion(null);
    setQuestionHistory([]);
  };

  const handleGoBack = () => {
    if (questionHistory.length > 0) {
      const previousQuestion = questionHistory[questionHistory.length - 1];
      setCurrentQuestion(previousQuestion);
      setQuestionHistory(questionHistory.slice(0, -1));
    } else {
      handleBackToHome();
    }
  };

  return (
    <div className="App">
      {currentView === 'front' && (
        <LetterFront onPhoneSubmit={handlePhoneSubmit} />
      )}
      {currentView === 'back' && (
        <LetterBack onLanguageSelect={handleLanguageSelect} />
      )}
      {currentView === 'home' && (
        <HomePage 
          language={selectedLanguage}
          onAnswerSelect={handleAnswerSelect}
        />
      )}
      {currentView === 'subpage' && (
        <SubPage 
          question={currentQuestion}
          language={selectedLanguage}
          onAnswerSelect={handleAnswerSelect}
          onGoBack={handleGoBack}
        />
      )}
    </div>
  );
}

export default App;
