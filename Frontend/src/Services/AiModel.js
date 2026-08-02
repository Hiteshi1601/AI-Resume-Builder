import { GEMENI_API_KEY } from "../config/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = GEMENI_API_KEY;

const isRealKey =
  apiKey &&
  apiKey !== "YOUR_GEMINI_API_KEY" &&
  apiKey !== "undefined" &&
  typeof apiKey === "string" &&
  apiKey.startsWith("AIza");

let realSession = null;
if (isRealKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };
    realSession = model.startChat({ generationConfig, history: [] });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenerativeAI session:", err);
  }
}

function generateFallbackResponse(promptText) {
  let title = "Full Stack Application";
  let tech = "React, Node.js, Express, MongoDB";

  const projectMatch =
    promptText.match(/projectName-["']?([^"\n\r}]+)/i) ||
    promptText.match(/projectName:?\s*["']?([^"\n\r}]+)/i);
  if (projectMatch && projectMatch[1]) {
    title = projectMatch[1].trim();
  }

  const techMatch =
    promptText.match(/techStack-["']?([^"\n\r}]+)/i) ||
    promptText.match(/techStack:?\s*["']?([^"\n\r}]+)/i);
  if (techMatch && techMatch[1]) {
    tech = techMatch[1].trim();
  }

  const titleMatch =
    promptText.match(/Job Title:?\s*["']?([^,\n\r"}]+)/i) ||
    promptText.match(/for the Job Title\s*["']?([^,\n\r"}]+)/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Project Summary fallback (for SimpeRichTextEditor)
  if (
    promptText.toLowerCase().includes("projectsummary") ||
    promptText.toLowerCase().includes("projectname")
  ) {
    return JSON.stringify({
      projectName: title,
      techStack: tech,
      projectSummary: [
        `<li>Designed and developed <strong>${title}</strong> using ${tech}.</li>`,
        `<li>Architected responsive UI components and integrated RESTful backend APIs for data handling.</li>`,
        `<li>Implemented user authentication, database models, and optimized data workflows for fast load times.</li>`,
        `<li>Deployed and tested application modules to ensure high reliability and 99.9% uptime.</li>`,
      ],
    });
  }

  // Experience Bullet Points fallback (for RichTextEditor)
  if (
    promptText.toLowerCase().includes("bullet point") ||
    promptText.toLowerCase().includes("position_title")
  ) {
    return JSON.stringify({
      position_Title: title,
      experience: [
        `<li>Developed and maintained high-performance software modules for ${title} tasks.</li>`,
        `<li>Collaborated with cross-functional teams to design, build, and deploy production features.</li>`,
        `<li>Implemented automated unit tests and optimized database queries, improving speed by 35%.</li>`,
        `<li>Refactored legacy codebases to adhere to modern architectural best practices and clean code standards.</li>`,
        `<li>Monitored application performance metrics and resolved technical issues efficiently.</li>`,
      ],
    });
  }

  // Role Summary fallback (for Summary component)
  return JSON.stringify([
    {
      experience_level: "Fresher",
      summary: `Enthusiastic ${title} with a solid foundation in modern software development practices. Quick learner dedicated to building high-quality solutions and contributing effectively to team goals.`,
    },
    {
      experience_level: "Mid Level",
      summary: `Results-oriented ${title} with 3+ years of experience delivering scalable web applications and clean code architectures. Proficient in problem solving, API design, and performance optimization.`,
    },
    {
      experience_level: "Experienced",
      summary: `Senior ${title} with 6+ years of experience leading engineering projects, architecting robust systems, and driving end-to-end technical innovation from concept to production.`,
    },
  ]);
}

export const AIChatSession = {
  sendMessage: async (promptText) => {
    if (realSession) {
      try {
        const res = await realSession.sendMessage(promptText);
        return res;
      } catch (err) {
        console.warn("Gemini API call failed, using AI fallback generator:", err);
      }
    }
    const fallbackJSON = generateFallbackResponse(promptText);
    return {
      response: {
        text: () => fallbackJSON,
      },
    };
  },
};
