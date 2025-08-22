const express = require("express");
const router = express.Router();
const { getSheetRecords } = require("../services/googleSheetsService");

// In-memory storage for phone numbers (for demonstration purposes)
const phoneNumbers = [];

router.get("/languages", async (req, res) => {
  try {
    const languages = [
      { code: "en", name: "English", nativeName: "English" },
      { code: "ar", name: "Arabic", nativeName: "العربية" },
      { code: "fa", name: "Persian", nativeName: "فارسی" },
    ];
    res.json({ success: true, data: languages, count: languages.length });
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

router.get("/letter/:questionId/:language", async (req, res) => {
  try {
    const { questionId, language } = req.params;
    const letterContent = await getSheetRecords("Letter_Content");
    const content = letterContent.find(
      (item) => item.questionId === questionId && item.language === language
    );
    if (content) {
      res.json({ success: true, data: content, language: language });
    } else {
      res.status(404).json({ success: false, message: "Letter content not found." });
    }
  } catch (error) {
    console.error("Error fetching letter content:", error);
    res.status(500).json({ success: false, message: "Failed to fetch letter content." });
  }
});

router.post("/phone", (req, res) => {
  const { phoneNumber, timestamp } = req.body;
  if (phoneNumber) {
    phoneNumbers.push({ phoneNumber, timestamp });
    console.log("Stored phone numbers:", phoneNumbers);
    res.json({ success: true, message: "Phone number stored successfully." });
  } else {
    res.status(400).json({ success: false, message: "Phone number is required." });
  }
});

router.get("/stats", (req, res) => {
  res.json({ success: true, data: { totalPhoneNumbers: phoneNumbers.length } });
});

module.exports = router;

