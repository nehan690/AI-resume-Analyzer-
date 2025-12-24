
import { GoogleGenAI, Type } from "@google/genai";
// Updated imports to include newly added types for code analysis and chat functionality
import { ResumeAnalysis, Language, AnalysisTab, Message } from "../types";
//dgh
// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not defined");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `You are a professional HR Expert and Career Coach with deep expertise in Applicant Tracking Systems (ATS). 
Your goal is to provide a comprehensive, honest, and actionable analysis of a candidate's resume. 
You must return your analysis in a structured JSON format.`;

export async function analyzeResume(resumeText: string, jobRole?: string): Promise<ResumeAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze the following resume${jobRole ? ` for the specific job role of: ${jobRole}` : ''}. 
  Provide a detailed evaluation.
  
  Resume Text:
  ${resumeText}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Overall resume score from 1 to 10" },
          atsCompatibility: { type: Type.NUMBER, description: "ATS compatibility score from 0 to 100" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywordSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING, description: "A brief executive summary of the resume's effectiveness" },
        },
        required: ["score", "atsCompatibility", "strengths", "weaknesses", "keywordSuggestions", "improvementRecommendations", "suggestedSkills", "summary"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ResumeAnalysis;
}

/**
 * Performs analysis on provided code based on the selected category.
 * Fixes: Module '"../services/geminiService"' has no exported member 'analyzeCode'.
 */
export async function analyzeCode(code: string, language: Language, tab: AnalysisTab): Promise<string> {
  // Use gemini-3-pro-preview for complex reasoning tasks like coding analysis
  const model = "gemini-3-pro-preview";
  
  const taskInstructions: Record<AnalysisTab, string> = {
    [AnalysisTab.EXPLAIN]: "Explain the functionality and architecture of this code clearly.",
    [AnalysisTab.BUGS]: "Identify potential bugs, security vulnerabilities, or logical errors.",
    [AnalysisTab.OPTIMIZE]: "Suggest performance optimizations and better coding practices.",
    [AnalysisTab.TESTS]: "Generate comprehensive test cases or unit tests.",
    [AnalysisTab.RESOURCES]: "Provide a list of documentation and learning resources for the concepts in this code."
  };

  const response = await ai.models.generateContent({
    model,
    contents: `Code Context (${language}):\n\n\`\`\`${language}\n${code}\n\`\`\``,
    config: {
      systemInstruction: `You are an expert developer and technical mentor. ${taskInstructions[tab]} Response must be in Markdown.`,
    }
  });

  return response.text || "No analysis could be generated.";
}

/**
 * Handles multi-turn chat interaction with a coding tutor.
 * Fixes: Module '"../services/geminiService"' has no exported member 'chatWithTutor'.
 */
export async function chatWithTutor(code: string, language: Language, history: Message[], userInput: string): Promise<string> {
  const model = "gemini-3-pro-preview";

  const chat = ai.chats.create({
    model,
    // Convert application history to the internal role format required by the SDK
    // @ts-ignore
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: `You are a helpful and patient AI coding tutor. You are assisting a student with their ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on explaining the logic and suggesting improvements.`,
    },
  });

  const response = await chat.sendMessage({ message: userInput });
  return response.text || "I'm having trouble responding right now. Please try again.";
}
