const express = require("express");
const router = express.Router();
const { getSheetRecords } = require("../services/googleSheetsService");

// Load questions data from Google Sheets
const loadQuestionsData = async () => {
  try {
    const questions = await getSheetRecords("Questions");
    const formattedQuestions = {};
    questions.forEach(q => {
      if (!formattedQuestions[q.id]) {
        formattedQuestions[q.id] = {};
      }
      formattedQuestions[q.id][q.language] = {
        id: q.id,
        title: q.title,
        question: q.question,
        options: q.options ? JSON.parse(q.options) : [],
        hasLetter: q.hasLetter === "TRUE",
        letterContent: q.letterContent,
        content: q.content
      };
    });
    return formattedQuestions;
  } catch (error) {
    console.error("Error loading questions data from Google Sheets:", error);
    return {};
  }
};

// GET /api/questions/home/:language
router.get("/home/:language", async (req, res) => {
  try {
    const { language } = req.params;
    const questionsData = await loadQuestionsData();
    
    const homeQuestion = questionsData.home?.[language] || questionsData.home?.en;
    
    if (!homeQuestion) {
      return res.status(404).json({ 
        error: "Home question not found",
        language: language 
      });
    }
    
    res.json({
      success: true,
      data: homeQuestion,
      language: language
    });
  } catch (error) {
    console.error("Error fetching home question:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// GET /api/questions/:questionId/:language
router.get("/:questionId/:language", async (req, res) => {
  try {
    const { questionId, language } = req.params;
    const questionsData = await loadQuestionsData();
    
    const question = questionsData[questionId]?.[language] || questionsData[questionId]?.en;
    
    if (!question) {
      return res.status(404).json({ 
        error: "Question not found",
        questionId: questionId,
        language: language 
      });
    }
    
    res.json({
      success: true,
      data: question,
      questionId: questionId,
      language: language
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// GET /api/questions/all/:language - Get all questions for a language
router.get("/all/:language", async (req, res) => {
  try {
    const { language } = req.params;
    const questionsData = await loadQuestionsData();
    
    const allQuestions = {};
    
    for (const [questionId, questionData] of Object.entries(questionsData)) {
      const question = questionData[language] || questionData.en;
      if (question) {
        allQuestions[questionId] = question;
      }
    }
    
    res.json({
      success: true,
      data: allQuestions,
      language: language,
      count: Object.keys(allQuestions).length
    });
  } catch (error) {
    console.error("Error fetching all questions:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// POST /api/questions/navigate - Handle navigation between questions
router.post("/navigate", async (req, res) => {
  try {
    const { fromQuestion, selectedOption, language } = req.body;
    
    if (!fromQuestion || !selectedOption || !language) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["fromQuestion", "selectedOption", "language"]
      });
    }
    
    const questionsData = await loadQuestionsData();
    const currentQuestion = questionsData[fromQuestion]?.[language] || questionsData[fromQuestion]?.en;
    
    if (!currentQuestion) {
      return res.status(404).json({ 
        error: "Current question not found",
        fromQuestion: fromQuestion 
      });
    }
    
    // Find the selected option
    let nextQuestionId = null;
    let selectedOptionData = null;
    
    if (currentQuestion.options) {
      selectedOptionData = currentQuestion.options.find(option => option.id === selectedOption);
      if (selectedOptionData) {
        nextQuestionId = selectedOptionData.nextQuestion;
      }
    } else if (currentQuestion.subQuestion && currentQuestion.subQuestion.options) {
      selectedOptionData = currentQuestion.subQuestion.options.find(option => option.id === selectedOption);
      if (selectedOptionData) {
        nextQuestionId = selectedOptionData.nextQuestion;
      }
    }
    
    if (!nextQuestionId) {
      return res.status(400).json({ 
        error: "Invalid option selected or no next question available",
        selectedOption: selectedOption 
      });
    }
    
    // Get the next question
    const nextQuestion = questionsData[nextQuestionId]?.[language] || questionsData[nextQuestionId]?.en;
    
    res.json({
      success: true,
      data: {
        fromQuestion: fromQuestion,
        selectedOption: selectedOptionData,
        nextQuestion: nextQuestion,
        nextQuestionId: nextQuestionId
      },
      language: language
    });
  } catch (error) {
    console.error("Error handling navigation:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

module.exports = router;

