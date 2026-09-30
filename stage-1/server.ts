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

  // Health check endpoint (for clean-container & orchestrator liveness checks)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Decision Memory AI / PocketForge Dark Factory',
      version: '1.0.0',
      offlineModeSupported: true,
      geminiAvailable: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Decision Memory REST API (100% offline deterministic evidence retrieval)
  app.get('/api/decisions', (req, res) => {
    const { q } = req.query;
    const sampleDecisions = [
      {
        id: 'DEC-001',
        topic: 'Integer Minor Units Currency Standard',
        question: 'Why do we store wallet balances and transfers in integer paise rather than floating-point rupee values?',
        decisionMade: 'All balances, inputs, fees, and transfers must strictly use positive 64-bit integer minor units (paise/cents).',
        whyMade: 'Floating point IEEE-754 arithmetic introduces cumulative balance drift during circular transfers.',
      },
      {
        id: 'DEC-002',
        topic: 'Per-Wallet Serializable Mutex Locking for Concurrency',
        question: 'Why did we implement per-wallet mutex queues instead of optimistic row versioning for transfers?',
        decisionMade: 'Implemented per-wallet mutex lock queue (two-lock ordering) before reading balances or executing debits.',
        whyMade: 'Guarantees strict linearizability and zero double-spending under concurrent transfers.',
      },
      {
        id: 'DEC-003',
        topic: 'Deterministic Idempotency Key Store with Check-and-Set',
        question: 'Why do we require client idempotency keys and cache completed transaction receipts?',
        decisionMade: 'Every transfer request requires a unique client-generated idempotency key.',
        whyMade: 'Protects against dropped TCP ACK packets and client network timeout retry storms.',
      },
      {
        id: 'DEC-004',
        topic: 'Two-Phase Atomic State Rollback on Mid-Transaction Crash',
        question: 'Why did we implement balance snapshotting and rollback checkpoints instead of trusting database auto-commit?',
        decisionMade: 'Pre-transaction state snapshots restore original balance on fault injection.',
        whyMade: 'Guarantees conservation of total system liquidity (Delta = 0).',
      },
      {
        id: 'DEC-005',
        topic: 'Independent Verifier Gatekeeper Architecture',
        question: 'Why is the Verification Agent separated from the Builder/Implementation Agent?',
        decisionMade: 'Decoupled verification into an independent gatekeeper that audits empirical evidence.',
        whyMade: 'Eliminates builder self-certification blindspots and enforces true red-team/blue-team checks.',
      },
    ];

    if (typeof q === 'string' && q.trim()) {
      const filtered = sampleDecisions.filter(d => 
        d.topic.toLowerCase().includes(q.toLowerCase()) || 
        d.question.toLowerCase().includes(q.toLowerCase()) ||
        d.whyMade.toLowerCase().includes(q.toLowerCase())
      );
      return res.json({ query: q, matchedDecisions: filtered.length > 0 ? filtered : sampleDecisions });
    }

    return res.json({ decisions: sampleDecisions, total: sampleDecisions.length });
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
