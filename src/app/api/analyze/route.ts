import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // 1. Check file type and extract text
    if (file.type === "application/pdf") {
      try {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error("PDF Parse Error:", err);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
      }
    } else if (file.type.startsWith("image/")) {
      try {
        const { data } = await Tesseract.recognize(buffer, "eng", {
          logger: (m) => console.log(m),
        });
        extractedText = data.text;
      } catch (err) {
        console.error("OCR Error:", err);
        return NextResponse.json({ error: "Failed to perform OCR on image" }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or an Image." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim() === "") {
      return NextResponse.json(
        { error: "No text could be extracted from the provided file." },
        { status: 400 }
      );
    }

    // 2. Analyze the text (Mock/Heuristic approach for the assignment)
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
