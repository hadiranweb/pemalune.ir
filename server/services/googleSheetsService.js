const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const path = require("path");

const SERVICE_ACCOUNT_FILE = path.join(__dirname, "..", "service_account.json");
const SPREADSHEET_ID = "1hQpHbNhVXohzdGzdA2ZqPCextxtXfNT_UyRJtVoEd68"; // Replace with your actual spreadsheet ID

let doc;

async function initializeGoogleSheets() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets
    console.log("Google Sheets initialized successfully.");
  } catch (error) {
    console.error("Error initializing Google Sheets:", error);
    throw new Error("Failed to initialize Google Sheets service.");
  }
}

async function getSheetRecords(sheetName) {
  if (!doc) {
    await initializeGoogleSheets();
  }
  try {
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      throw new Error(`Sheet with title "${sheetName}" not found.`);
    }
    const rows = await sheet.getRows();
    return rows.map((row) => row.toObject());
  } catch (error) {
    console.error(`Error reading sheet "${sheetName}":`, error);
    throw new Error(`Failed to read data from sheet "${sheetName}".`);
  }
}

module.exports = {
  initializeGoogleSheets,
  getSheetRecords,
};

