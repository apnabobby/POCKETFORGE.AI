import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side Google GenAI instance with required headers
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for Gemini autonomous agent reasoning
  app.post('/api/factory/agent-reasoning', async (req, res) => {
    try {
      const { agentType, task, context } = req.body;

      if (!ai) {
        return res.json({
          status: 'simulated',
          message: 'Server GEMINI_API_KEY not configured. Falling back to deterministic factory simulation.',
        });
      }

      const prompt = `You are the ${agentType} for PocketForge AI, an autonomous software dark factory for financial systems (POCKETFUL track).
User task: "${task}"
Context: ${JSON.stringify(context || {})}

Provide your formal structured engineering output in clean JSON with fields:
- agent: "${agentType}"
- summary: string
- keyFindings: array of strings
- invariantsPreserved: array of strings (e.g. integer arithmetic in paise/cents, conservation of total money, zero double spending, strict idempotency, serializable isolation)
- recommendation: string`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return res.json({
        status: 'success',
        result: JSON.parse(response.text || '{}'),
      });
    } catch (error: any) {
      console.error('Gemini Agent Error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Agent reasoning generation failed',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'PocketForge AI Dark Factory',
      geminiAvailable: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[PocketForge AI Dark Factory] running on port ${port} (mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
