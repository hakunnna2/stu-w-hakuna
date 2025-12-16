import { GoogleGenAI, Type } from "@google/genai";
import { Exam, StudySession } from "../types";

// Helper to generate a unique ID (simple version)
const generateId = () => Math.random().toString(36).substr(2, 9);

// Access API key from Vite environment variables (Netlify/Local) or fallback to process.env
// The 'import.meta' is a Vite/ESM feature. 
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || "";

if (!apiKey) {
  console.warn("Missing API Key. Please set VITE_API_KEY in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export const getMotivationalQuote = async (): Promise<string> => {
  if (!apiKey) return "Please configure your API Key in Netlify settings.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a short, punchy, non-cringe motivational quote for a university student who is stressed about exams. Keep it under 20 words.",
    });
    return response.text.replace(/"/g, '').trim();
  } catch (error) {
    console.error("Gemini Motivation Error:", error);
    return "You've got this. One step at a time.";
  }
};

export const suggestPriority = async (tasks: string[]): Promise<string> => {
  if (!apiKey) return "";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have these tasks: ${tasks.join(', ')}. Which one should I do first for maximum impact? Reply with just the task name.`,
    });
    return response.text.trim();
  } catch (e) {
    return "";
  }
};