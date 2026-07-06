import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import rateLimit from "express-rate-limit";

// Polyfill DOMMatrix for pdf-parse with type definitions
declare global {
  interface DOMMatrixInit {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
  }
}

(globalThis as any).DOMMatrix = class DOMMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }
};

// Use dynamic import for pdf-parse
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits to handle large pasted resumes or jobs safely
app.use(express.json({ limit: "10mb" }));

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API endpoints
app.use("/api", apiLimiter);

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for CVData parsing and tailoring
const personalInfoSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING },
    website: { type: Type.STRING },
    summary: { type: Type.STRING, description: "A high-impact 3-4 sentence professional summary" },
  },
  required: ["fullName", "email", "phone", "location", "website", "summary"],
};

const experienceSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A random unique string id" },
    company: { type: Type.STRING },
    position: { type: Type.STRING },
    location: { type: Type.STRING },
    startDate: { type: Type.STRING, description: "e.g., 'Jan 2021' or '2021'" },
    endDate: { type: Type.STRING, description: "e.g., 'Present' or 'Dec 2023'" },
    current: { type: Type.BOOLEAN },
    description: { type: Type.STRING, description: "Detailed description of achievements, projects, and roles, formatted as clear, markdown-friendly bullet points" },
  },
  required: ["company", "position", "startDate", "endDate", "current", "description"],
};

const educationSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A random unique string id" },
    institution: { type: Type.STRING },
    degree: { type: Type.STRING, description: "e.g., 'Bachelor of Science'" },
    fieldOfStudy: { type: Type.STRING, description: "e.g., 'Computer Science'" },
    location: { type: Type.STRING },
    startDate: { type: Type.STRING },
    endDate: { type: Type.STRING },
    current: { type: Type.BOOLEAN },
    description: { type: Type.STRING },
  },
  required: ["institution", "degree", "startDate", "endDate", "current"],
};

const projectSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A random unique string id" },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    technologies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    link: { type: Type.STRING },
  },
  required: ["name", "description", "technologies"],
};

const skillCategorySchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A random unique string id" },
    name: { type: Type.STRING, description: "e.g., 'Languages', 'Frameworks', 'Tools', 'Soft Skills'" },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["name", "skills"],
};

const cvDataSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: personalInfoSchema,
    experience: { type: Type.ARRAY, items: experienceSchema },
    education: { type: Type.ARRAY, items: educationSchema },
    projects: { type: Type.ARRAY, items: projectSchema },
    skills: { type: Type.ARRAY, items: skillCategorySchema },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["personalInfo", "experience", "education", "skills"],
};

const tailoredCVResultSchema = {
  type: Type.OBJECT,
  properties: {
    tailoredCV: cvDataSchema,
    analysis: {
      type: Type.OBJECT,
      properties: {
        matchScore: { type: Type.INTEGER, description: "Overall match rating from 0 to 100 based on the tailored CV and job description" },
        keywordsMatched: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical terms, technologies, or keywords from the JD that are now integrated into the CV" },
        keywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Desired terms or qualifications from the JD not fully covered by candidate's history, but noted for preparation" },
        summaryOfChanges: { type: Type.STRING, description: "A professional bulleted summary explaining what aspects of the CV were rewritten and why (e.g., rephrasing summary to emphasize cloud experience)" },
        interviewTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 high-yield tips on how the candidate can talk about these tailored aspects in their interview" },
      },
      required: ["matchScore", "keywordsMatched", "keywordsMissing", "summaryOfChanges", "interviewTips"],
    },
  },
  required: ["tailoredCV", "analysis"],
};

// --- API ROUTES ---

// Parse raw resume text into structured CVData
app.post("/api/parse-cv", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Please provide the CV text to parse." });
      return;
    }
    if (text.trim().length < 20) {
      res.status(400).json({ error: "The provided text is too short. Please paste a complete CV." });
      return;
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) parser. Parse the following raw CV/Resume text and structure it into a perfect, complete JSON payload conforming to the requested schema. Extrapolate missing short details like IDs, or leave optional fields empty where not available. Do not invent fake work histories, but do represent the provided details with professional, high-standard prose and structure.

Raw resume text:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional recruiting assistant specialized in parsing raw text CVs into structured JSON datasets.",
        responseMimeType: "application/json",
        responseSchema: cvDataSchema,
        temperature: 0.1,
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error parsing CV:", error);
    let userMessage = "We had trouble parsing your CV. Please double-check your input and try again.";
    if (error?.message?.includes("API key")) {
      userMessage = "There's an issue with our AI service. Please try again later.";
    }
    res.status(500).json({ error: userMessage });
  }
});

// Parse PDF, DOCX, Word, or TXT file into structured CVData
app.post("/api/parse-cv-file", async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData || typeof fileData !== "string") {
      res.status(400).json({ error: "Please upload a valid file." });
      return;
    }

    const buffer = Buffer.from(fileData, "base64");
    let extractedText = "";

    const lowerName = (fileName || "").toLowerCase();
    const isPDF = mimeType === "application/pdf" || lowerName.endsWith(".pdf");
    const isDOCX = mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || lowerName.endsWith(".docx");
    const isTXT = mimeType === "text/plain" || lowerName.endsWith(".txt");

    if (isPDF) {
      try {
        const parsedPdf = await pdf(buffer);
        extractedText = parsedPdf.text;
      } catch (pdfErr: any) {
        console.error("PDF Parsing Error detail:", pdfErr);
        res.status(400).json({ 
          error: "We couldn't read your PDF file. Please ensure it's a text-based PDF (not an image scan) and try again, or paste your CV text directly."
        });
        return;
      }
    } else if (isDOCX) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxErr: any) {
        console.error("DOCX Parsing Error:", docxErr);
        res.status(400).json({ error: "We couldn't read your Word document. Please try a different file or paste your CV text directly." });
        return;
      }
    } else if (isTXT) {
      extractedText = buffer.toString("utf-8");
    } else {
      res.status(400).json({ error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file, or paste your CV text directly." });
      return;
    }

    if (!extractedText || !extractedText.trim()) {
      res.status(400).json({ error: "The uploaded file has no readable text. Please try a different file or paste your CV text directly." });
      return;
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) parser. Parse the following raw CV/Resume text and structure it into a perfect, complete JSON payload conforming to the requested schema. Extrapolate missing short details like IDs, or leave optional fields empty where not available. Do not invent fake work histories, but do represent the provided details with professional, high-standard prose and structure.

Raw resume text:
"""
${extractedText}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional recruiting assistant specialized in parsing raw text CVs into structured JSON datasets.",
        responseMimeType: "application/json",
        responseSchema: cvDataSchema,
        temperature: 0.1,
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error parsing CV file:", error);
    let userMessage = "We had trouble processing your file. Please try again or paste your CV text directly.";
    if (error?.message?.includes("API key")) {
      userMessage = "There's an issue with our AI service. Please try again later.";
    }
    res.status(500).json({ error: userMessage });
  }
});

// Tailor an existing CV to a job description
app.post("/api/tailor-cv", async (req, res) => {
  try {
    const { cvData, jobDescription } = req.body;
    if (!cvData || !jobDescription) {
      res.status(400).json({ error: "Please provide both your CV and a job description." });
      return;
    }
    if (jobDescription.trim().length < 30) {
      res.status(400).json({ error: "The job description is too short. Please paste a complete job posting." });
      return;
    }

    const prompt = `You are a world-class career coach and professional CV writer. Your task is to review the candidate's structured CV data and rewrite/tailor it to align perfectly with the provided Job Description (JD).

FACTUAL INTEGRITY RULES:
1. Do NOT invent fake jobs, degrees, or years. Keep the original companies, roles, and dates intact.
2. You CAN reframe descriptions, re-order bullet points, rewrite summary statements, highlight relevant skills, and describe achievements with keywords that match the Job Description.

TAILORING WORK:
1. Rewrite the Personal Info Summary to echo keywords and key focus areas requested in the JD.
2. For each Experience item, rewrite or add bullet points to focus on transferrable skills, specific metrics, or methodologies mentioned in the JD that match the candidate's actual history.
3. Organize skills: ensure relevant skills required by the JD are prominently represented.
4. Prepare a crisp tailoring analysis report including a Match Score, matching keywords, missing keywords, a summary of what you changed, and high-quality interview preparation tips.

Candidate CV Data:
${JSON.stringify(cvData, null, 2)}

Target Job Description:
"""
${jobDescription}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master career consultant who tailors resumes for maximum ATS compatibility and hiring manager appeal, while maintaining absolute factual honesty.",
        responseMimeType: "application/json",
        responseSchema: tailoredCVResultSchema,
        temperature: 0.2,
      },
    });

    const tailoredData = JSON.parse(response.text?.trim() || "{}");
    res.json(tailoredData);
  } catch (error: any) {
    console.error("Error tailoring CV:", error);
    let userMessage = "We had trouble tailoring your CV. Please try again in a moment.";
    if (error?.message?.includes("API key")) {
      userMessage = "There's an issue with our AI service. Please try again later.";
    }
    res.status(500).json({ error: userMessage });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CV Builder Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
