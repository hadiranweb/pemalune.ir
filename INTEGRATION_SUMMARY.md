# Integration Summary: Interactive Letter & Sheet-Connected Model

**Date:** 2025-08-21
**Author:** Manus AI

## 1. Executive Summary

This document outlines the integration of the **"Interactive Letter"** application (the question-based website with SVG animations) with the **"Pema System"** (the sheet-connected website model). The primary goal was to combine the dynamic, user-facing features of the Interactive Letter with the data-driven content management capabilities of the Pema System, where content is fetched directly from Google Sheets.

### 1.1. Integration Goal

The objective was to create a unified application where:
- The frontend experience (SVG animations, multi-level questions, 3D flips) from the Interactive Letter is preserved.
- The backend logic is replaced to fetch all questions, options, and content dynamically from a Google Sheet, as demonstrated in the Pema System.
- The deployment process is standardized using a unified Docker configuration that is robust and easy to manage, inspired by the Pema System's Docker setup.

### 1.2. Key Outcomes

- **Successful Logic Migration**: The Python/Flask backend logic from the Pema System for reading from Google Sheets has been successfully migrated and adapted into the Node.js/Express backend of the Interactive Letter application.
- **Unified Codebase**: The frontend (React) and backend (Node.js) are now part of a single, cohesive project structure.
- **Dynamic Content**: The application no longer relies on hardcoded JSON files for questions and content. All text, questions, and navigation logic are now driven by the content of a Google Sheet.
- **Streamlined Docker Deployment**: A new, multi-stage `Dockerfile` and a `docker-compose.yml` file have been created to manage the entire application stack (frontend and backend) as a single service, simplifying deployment and scaling.

This document details the specific changes made and, most importantly, outlines the **necessary actions you need to take** to complete the setup and run the integrated application successfully.


## 2. Architecture Overview (Before vs. After)

Prior to integration, the Interactive Letter application consisted of a React frontend delivering a highly interactive, SVG-driven user experience with a question-based navigation model. The backend was a Node.js Express server that served content from local JSON files and handled lightweight endpoints like phone number collection. The Pema System, on the other hand, employed a Python/Flask backend that sourced content from Google Sheets using a service account, alongside a simple static frontend driven by data fetched from those sheets. The deployment patterns also differed: the Pema System shipped with a Python-centric Dockerfile and a compose file, whereas the Interactive Letter project had separate Dockerfiles for frontend and backend but lacked a unified, production-grade stack.

After the integration, the solution adopts a unified architecture based on Node.js/Express for the backend while inheriting the Pema System’s sheet-connected data model. The React frontend remains responsible for the interactive experience, preserving the 3D letter flip, language selection, and multi-level questions. All question trees, option routing, and letter content now flow from a Google Sheet, which allows non-developers to make content changes without code deployments. Deployment is standardized via a single multi-stage Dockerfile and a Docker Compose configuration designed to mirror the Pema System’s operational approach, including secure handling of the Google service account.

This results in a cohesive, maintainable stack: React for the UI, Node.js for the API, Google Sheets for content management, and Docker for repeatable deployment.

## 3. Implemented Changes (What We Changed and Why)

### 3.1. Backend (Node.js/Express)

We introduced a service layer to integrate with Google Sheets in place of local JSON files:

- services/googleSheetsService.js: Implements authentication with Google Sheets using a service account (JWT) and provides utility functions to read records from specific sheets. This replaces static content and shifts all question and letter content to a data-driven model.
- index.js: Initializes the Google Sheets service on server startup. This ensures API routes can immediately query the sheet-backed data. It also retains existing middleware such as Helmet, CORS, morgan, and body parsing.
- routes/content.js: Reworked to fetch letter content from the "Letter_Content" sheet rather than from embedded objects. The languages endpoint remains simple and explicit (English, Arabic, Persian) to match the UI.
- routes/questions.js: Rewritten to load the entire question set from the "Questions" sheet. It maps sheet rows into the question schema used by the frontend, including titles, prompts, and JSON-encoded options that define the navigational flow. It also supports language fallbacks, mirroring the prior JSON-based behavior.

These changes preserve the contract of the existing frontend endpoints (/api/questions/... and /api/content/...) while swapping the data source. This means the React code continues to function with minimal adjustments.

### 3.2. Frontend (React)

The frontend’s visual and behavioral features have been preserved:

- LetterFront and LetterBack components continue to drive the 3D flip animation and language selection. The CSS transforms and lazy-loading hooks remain intact.
- HomePage and SubPage components still request question data by ID and language, but the data now originates from the Google Sheet via the Node backend.
- The LazyImage component and custom Intersection Observer-based hook remain in use to reduce time-to-interactive on content-heavy pages.

Where needed, API service calls were adjusted to ensure endpoints are consistent with the new backend data model. No breaking UI changes were introduced.

### 3.3. Environment and Secrets

To support the Google Sheets connection, new environment variables are required:

- GOOGLE_SERVICE_ACCOUNT_EMAIL: The service account email from your Google Cloud project.
- GOOGLE_PRIVATE_KEY: The service account’s private key in one line with escaped newlines (\n). This is critical to load the key reliably from environment variables.
- GOOGLE_SPREADSHEET_ID: The target spreadsheet ID containing the "Questions" and "Letter_Content" sheets.

The backend also expects a server/service_account.json file to be mounted in containerized deployments, mirroring Pema’s operational practice. None of these secrets are committed to the repository and should be managed via environment variables and volume mounts.

### 3.4. Docker and Compose

A unified Dockerfile at the project root now builds both the React frontend and the Node.js backend:

- Stage 1 builds the React app using Node 20 Alpine and produces static assets.
- Stage 2 assembles the production Node.js backend and copies the built frontend assets into a /public directory served by Express (or available to be served behind Nginx if you choose a reverse proxy).

The docker-compose.yml file standardizes the runtime configuration:

- Exposes port 5000 for the API and integrated app.
- Mounts service_account.json securely as a read-only volume.
- Accepts environment variables for Google credentials and spreadsheet ID.
- Adds a healthcheck for the /api/health endpoint.

This approach borrows the operational simplicity of the Pema System’s Docker while maintaining a Node-first stack.

### 3.5. Repository and CI/CD Readiness

The project now includes a Git-based deployment guide designed to help you push the code to a remote repository and perform server-side deployments using Docker Compose. This lays the groundwork for adding CI/CD via GitHub Actions or GitLab CI in the future, enabling automatic builds, image publishing to a container registry, and zero-downtime rollouts on your Ubuntu server.



## 4. User Actions Required (What You Need to Do)

To make the integrated application fully functional, you must complete the following steps. These actions involve configuring your Google Cloud and Google Sheets environment, which I cannot do for you due to security and access limitations.

### 4.1. **Configure Google Cloud Service Account**

This is the most critical step. The application needs credentials to access your Google Sheet.

1.  **Go to the Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com/)
2.  **Create a New Project** (or select an existing one).
3.  **Enable the Google Sheets API**: In the project dashboard, go to "APIs & Services" > "Library", search for "Google Sheets API", and enable it.
4.  **Create a Service Account**: Go to "APIs & Services" > "Credentials", click "Create Credentials", and select "Service Account".
    -   Give it a name (e.g., `interactive-letter-sheet-reader`).
    -   Grant it the **"Editor"** role. This is necessary for the application to read and potentially write to the sheet.
5.  **Generate a JSON Key**: After creating the service account, click on it, go to the "Keys" tab, click "Add Key", and select "Create new key". Choose **JSON** as the key type. A `service_account.json` file will be downloaded to your computer.

### 4.2. **Set Up Your Google Sheet**

The application is hardcoded to look for a specific Google Sheet with specific tab names and column headers. You must create this sheet and structure it correctly.

1.  **Create a New Google Sheet**.
2.  **Get the Spreadsheet ID**: The ID is the long string of characters in the URL of your sheet (e.g., `.../spreadsheets/d/SPREADSHEET_ID/edit`).
3.  **Create Two Sheets (Tabs)**:
    -   Rename the first sheet to **`Questions`**.
    -   Create a second sheet and name it **`Letter_Content`**.
4.  **Structure the `Questions` Sheet**: Add the following headers in the first row:
    | id | language | title | question | options | hasLetter | letterContent | content |
    |---|---|---|---|---|---|---|---|
    -   **`id`**: A unique identifier for each question (e.g., `home`, `services`, `contact`).
    -   **`language`**: The language code (`en`, `ar`, `fa`).
    -   **`title`**: The title of the page/question.
    -   **`question`**: The main question text.
    -   **`options`**: A JSON string representing the answer options. Example: `[{"id":"opt1","text":"Learn More","nextQuestion":"services"}]`
    -   **`hasLetter`**: `TRUE` or `FALSE` (uppercase) to indicate if this question has associated letter content.
    -   **`letterContent`**: The actual letter content (can be left blank if `hasLetter` is `FALSE`).
    -   **`content`**: Any additional page content.

5.  **Structure the `Letter_Content` Sheet**: Add the following headers:
    | questionId | language | content |
    |---|---|---|
    -   **`questionId`**: The ID of the question this letter content belongs to.
    -   **`language`**: The language code.
    -   **`content`**: The full letter content.

6.  **Share the Sheet**: Click the "Share" button in your Google Sheet and share it with the service account email address (found in your `service_account.json` file). Give it **"Editor"** permissions.

### 4.3. **Configure Your Deployment Environment**

1.  **Place `service_account.json`**: Copy the `service_account.json` file you downloaded into the `server/` directory of the project.
2.  **Create and Configure `.env` File**: In the root of the project, copy `.env.example` to a new file named `.env`.
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in the following values:
    -   `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The `client_email` from your `service_account.json`.
    -   `GOOGLE_PRIVATE_KEY`: The `private_key` from your `service_account.json`. **Important**: The key must be enclosed in double quotes and newlines must be replaced with `\n`.
    -   `GOOGLE_SPREADSHEET_ID`: The ID of your Google Sheet.

### 4.4. **Deploy the Application**

Once the above steps are complete, you can deploy the application using Docker Compose as described in the `GIT_DEPLOYMENT_GUIDE.md` or `DEPLOYMENT_GUIDE.md`.

```bash
# On your server, in the project directory
docker-compose up --build -d
```

## 5. Troubleshooting and Verification

After deployment, if the application is not working as expected, here’s how to troubleshoot:

1.  **Check Docker Logs**: This is the first place to look for errors.
    ```bash
    docker-compose logs -f
    ```
    -   Look for **"Google Sheets service initialized"**. If you see "Failed to initialize", there is a problem with your credentials or `service_account.json`.
    -   Look for errors related to reading sheets (e.g., "Sheet with title ... not found"). Ensure your sheet names and column headers are correct.

2.  **Test API Endpoints**: Use `curl` or a tool like Postman to test the API directly.
    ```bash
    # On your server
    curl http://localhost:5000/api/health
    curl http://localhost:5000/api/questions/home/en
    ```
    If you get a 404 or 500 error, the backend is likely unable to fetch data from your sheet.

3.  **Verify Google Sheet Structure**: Double-check that your column headers are exactly as specified and that the JSON in the `options` column is valid.

By following these steps, you will be able to successfully run the integrated application and manage its content dynamically through Google Sheets.

