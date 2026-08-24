# Social Media Content Analyzer

**Live Application URL:** [https://unthinkable-submission.vercel.app](https://unthinkable-submission.vercel.app)

This project is a web application that helps users analyze their social media content and suggests engagement improvements. Built as part of the technical assessment for the Software Engineer position.

## Approach & Architecture

My approach focuses on creating a clean, production-ready full-stack application using **Next.js (App Router)** and **Tailwind CSS**. 

For the frontend, I implemented a robust drag-and-drop interface using `react-dropzone`. This provides an intuitive user experience with clear loading states and error handling. 

For the backend, I utilized Next.js API Routes to handle file processing securely on the server. I integrated two primary extraction libraries:
1. `pdf-parse`: For extracting text from PDF files while maintaining the core content.
2. `tesseract.js`: For OCR (Optical Character Recognition) to extract text from images and scanned documents.

Due to the absence of a configured API key for an AI/ML service, the application currently uses a heuristic-based mock analyzer that simulates the ML behavior. It evaluates word count, hashtag usage, and questions to provide actionable engagement suggestions. The architecture is designed to be easily extensible; swapping the mock analyzer with an LLM integration (like Google Gemini or OpenAI) only requires replacing a single function in the API route.

## Setup & Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Features Built
- ✅ **Document Upload:** Drag-and-drop interface supporting PDF, PNG, JPG, and JPEG.
- ✅ **Text Extraction (PDF Parsing):** Extracts text from uploaded PDF documents.
- ✅ **Text Extraction (OCR):** Uses Tesseract.js to read text from uploaded images.
- ✅ **Content Analysis:** Analyzes the extracted text to provide engagement improvements.
