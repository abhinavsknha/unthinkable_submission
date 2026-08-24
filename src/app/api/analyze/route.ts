import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

// Polyfill DOMMatrix for pdf-parse if it doesn't exist in the Node.js / Edge environment
if (typeof global !== "undefined" && typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {
    a=1; b=0; c=0; d=1; e=0; f=0;
  };
}
if (typeof global !== "undefined" && typeof global.Path2D === "undefined") {
  (global as any).Path2D = class Path2D {};
}

// Basic heuristic-based analysis for engagement improvements
function generateMockAnalysis(text: string) {
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const hasHashtags = /#\w+/.test(text);
  const hasQuestions = /\?/.test(text);
  
  const suggestions = [];
  
  if (wordCount < 10) {
    suggestions.push("The post is very short. Consider adding more context or a brief story to engage readers.");
  } else if (wordCount > 100) {
    suggestions.push("The post is quite long. Make sure to use line breaks and keep the most important hook at the beginning.");
  }
  
  if (!hasHashtags) {
    suggestions.push("Include 3-5 relevant hashtags to increase discoverability.");
  }
  
  if (!hasQuestions) {
    suggestions.push("Add a question at the end to encourage comments and interaction.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Great job! The length is good, it includes hashtags, and prompts the user with a question.");
  }

  return {
    wordCount,
    suggestions,
    summary: "Based on heuristics, here are a few ways to improve your post's engagement."
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // 1. If text was already extracted on the client (e.g. OCR for images)
    const clientText = formData.get("text") as string | null;
    if (clientText) {
      const analysis = generateMockAnalysis(clientText);
      return NextResponse.json({
        success: true,
        extractedText: clientText,
        analysis,
      });
    }

    // 2. Otherwise, process the file (PDF)
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file or text provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf") {
      try {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error("PDF Parse Error:", err);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type on backend. Images should be processed on the client." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim() === "") {
      return NextResponse.json(
        { error: "No text could be extracted from the provided file." },
        { status: 400 }
      );
    }

    // Analyze the text
    const analysis = generateMockAnalysis(extractedText);

    return NextResponse.json({
      success: true,
      extractedText,
      analysis,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during processing." },
      { status: 500 }
    );
  }
}
