import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // API Route: AI Writing Tutor Feedback (Middle School Grade 3 Korean Writing Tutor)
  app.post('/api/ai-feedback', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY가 설정되지 않았습니다. AI 피드백 기능을 사용하려면 Secrets에 API 키를 등록하세요.',
        });
      }

      const { topic, claim, reason1, reason2, reason3, introduction, body, conclusion } = req.body;

      if (!topic || !claim) {
        return res.status(400).json({ error: '주제와 주장은 필수 항목입니다.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
당신은 대한민국 중학교 3학년 국어 선생님입니다.
학생이 작성한 '주장하는 글(논설문)' 개요 및 본문을 읽고 친절하고 격려 넘치는 따뜻한 톤으로 피드백을 작성해 주세요.

[학생 글 작성 내용]
- 주제: ${topic}
- 나의 주장: ${claim}
- 근거 1: ${reason1 || '(작성되지 않음)'}
- 근거 2: ${reason2 || '(작성되지 않음)'}
- 근거 3: ${reason3 || '(작성되지 않음)'}
- 서론 (문제 제기 및 배경): ${introduction || '(작성되지 않음)'}
- 본론 (주장 및 근거 세부 설명): ${body || '(작성되지 않음)'}
- 결론 (핵심 요약 및 당부): ${conclusion || '(작성되지 않음)'}

[피드백 요구사항]
1. 총평 & 칭찬 (2~3문장): 주장과 주제의 유기적 연결, 학생의 개성이 드러난 점 칭찬
2. 근거의 타당성 점검 (2~3문장): 제시된 근거들이 주장을 충분히 뒷받침하는지, 사실/통계/사례 등 보완점이 있는지 안내
3. 서론-본론-결론 구조 조언 (2~3문장): 논설문 3단 구성이 잘 이루어졌는지 조언
4. 추천 피드백 문장 (동료들이 카카오/댓글에 남겨주면 좋을 피드백 문장 2개 예시)

응답은 JSON 형식으로 출력해 주세요. JSON 구조 예시:
{
  "praise": "칭찬 메시지 내용...",
  "evidenceFeedback": "근거에 대한 조언...",
  "structureFeedback": "구조에 대한 조언...",
  "recommendedComments": ["동료 피드백 추천 문장 1", "동료 피드백 추천 문장 2"],
  "scoreRating": "매우 우수 | 우수 | 발전 가능"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('AI 응답을 생성하지 못했습니다.');
      }

      const feedbackData = JSON.parse(responseText);
      return res.json({ success: true, feedback: feedbackData });
    } catch (error: any) {
      console.error('AI feedback error:', error);
      return res.status(500).json({
        error: error.message || 'AI 피드백 생성 도중 오류가 발생했습니다.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
