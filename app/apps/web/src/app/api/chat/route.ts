import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;
  private readonly requestLimit: number;
  private readonly windowMs: number;

  constructor(requestLimit: number, windowMs: number) {
    this.requests = new Map();
    this.requestLimit = requestLimit;
    this.windowMs = windowMs;
  }

  public async checkLimit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const record = this.requests.get(identifier);

    // Clean up expired entries
    if (record && now > record.resetTime) {
      this.requests.delete(identifier);
    }

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        success: true,
        limit: this.requestLimit,
        remaining: this.requestLimit - 1,
        reset: Math.ceil((now + this.windowMs - now) / 1000),
      };
    }

    const currentRecord = this.requests.get(identifier)!;
    const remaining = this.requestLimit - currentRecord.count;

    if (remaining <= 0) {
      return {
        success: false,
        limit: this.requestLimit,
        remaining: 0,
        reset: Math.ceil((currentRecord.resetTime - now) / 1000),
      };
    }

    currentRecord.count += 1;
    this.requests.set(identifier, currentRecord);

    return {
      success: true,
      limit: this.requestLimit,
      remaining: remaining - 1,
      reset: Math.ceil((currentRecord.resetTime - now) / 1000),
    };
  }
}

// Create a new rate limiter that allows 10 requests per minute
const rateLimiter = new RateLimiter(10, 60 * 1000);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Healthcare context and safety instructions for the AI
const SYSTEM_CONTEXT = `You are a healthcare information assistant. Your role is to:
- Provide general health and wellness information
- Explain medical terms and procedures in simple language
- Share lifestyle and preventive health tips
- Guide users to reliable health resources

You must NOT:
- Diagnose medical conditions
- Recommend specific treatments or medications
- Provide emergency medical advice
- Replace professional medical consultation

Always include a disclaimer when appropriate and encourage users to consult healthcare professionals for specific medical concerns.`;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Rate limiting - fix type error by providing a default string
    const identifier = session.user.email || session.user.id || 'anonymous';
    const rateLimitResult = await rateLimiter.checkLimit(identifier);
    
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          details: `Please try again in ${rateLimitResult.reset} seconds`,
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const { message } = await req.json();
    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    // Initialize Gemini model with safety settings
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Start chat with system context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "What is your role and what are your limitations?" }],
        },
        {
          role: "model",
          parts: [{ text: SYSTEM_CONTEXT }],
        },
      ],
    });

    // Get response from AI
    const chatResult = await chat.sendMessage([{ text: message }]);
    const response = await chatResult.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat request",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 