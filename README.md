# Premed Tutorials CBT Platform

This project is a completely standalone application built with Vite, React, Express, and MongoDB. It has no dependencies on the AI Studio environment and can be run locally or deployed to platforms like Render, Heroku, or DigitalOcean easily.

## Prerequisites

1.  **Node.js**: Ensure you have Node 18+ installed.
2.  **MongoDB**: You need a MongoDB database. You can run one locally or use a free tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

## Installation

1.  Unzip the exported codebase into a new directory.
2.  Open your terminal in the directory and run:
    ```bash
    npm install
    ```

## Configuration

1.  Create a file named `.env` in the root of the directory (next to `package.json`).
2.  Add the following environment variables to the `.env` file:
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
    JWT_SECRET=replace_this_with_a_long_random_string_of_text
    NODE_ENV=development
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### What are these variables?

*   **`MONGODB_URI`**: The connection link to your MongoDB database. You get this from MongoDB Atlas.
*   **`JWT_SECRET`**: This is like a master password your server uses to create secure login tokens for users. 
    *   *What to use:* You can literally make up any long, random string. For example: `JWT_SECRET=super_secret_cat_password_83749283` or a generated hash. Just make sure it stays secret!
*   **`NODE_ENV`**: Tells the server what mode it's running in.
    *   *What to use:* Use `NODE_ENV=development` when you are running it locally on your computer. Use `NODE_ENV=production` when you officially deploy it to a server (like Render, Heroku, Vercel, or AWS).
*   **`GEMINI_API_KEY`**: Your Google Gemini API key, used for the completely automated AI Question Injector (creates multiple choice questions from syllabus text).
    *   *What to use:* Get this from [Google AI Studio](https://aistudio.google.com/app/apikey). When deploying to a site like Vercel, you will add this exactly as `GEMINI_API_KEY` in their Environment Variables settings page.

## Running Locally

To run the full stack application (which serves both the React frontend and Express backend on the same port):

1.  Run the development command:
    ```bash
    npm run dev
    ```
2.  The application should now be accessible at `http://localhost:3000`.

## Production Build

To build and run the application for production:

1.  Build the React frontend:
    ```bash
    npm run build
    ```
2.  Start the Express server:
    ```bash
    npm start
    ```

## Note on "AI Studio Dependency"

You mentioned removing the AI Studio dependency. Everything in this codebase is purely open-source standard technologies (React, Express, MongoDB, Tailwind, Vite). The platform runs on them natively. To export the code:

1.  Click the **Export/Download** button in the top right corner of the AI Studio editor header (it usually looks like a download icon or is inside the settings gear / three-dots menu).
2.  Download the **ZIP** file or push it directly to your **GitHub** account.
3.  Follow the instructions above to run it anywhere!
