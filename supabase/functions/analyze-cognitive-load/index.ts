import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // 1. Обработка CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    
    // Твоя система поиска текста в теле запроса
    const rawText = body.text || body.content || body.textPassage || body.contentArea || body.words;
    
    if (!rawText) {
      console.error("Received body keys:", Object.keys(body));
      throw new Error("No text provided in any known field");
    }

    const safeText = rawText.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 5000);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    // НАТИВНЫЙ эндпоинт Google Gemini
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemPrompt = `You are a Cognitive Load Expert and Reading Complexity Analyst. 
    Task: Analyze text for cognitive difficulty. Return ONLY valid JSON.
    Structure: {
      "loadPoints": [{ "position": number, "word": "string", "load": 0-100, "reason": "string" }],
      "overallScore": number,
      "heatmapSegments": [{ "text": "string", "load": 0-100, "startIndex": number, "endIndex": number }],
      "scaffoldingAdvice": [{ "position": "string", "advice": "string", "priority": "high"|"medium"|"low" }],
      "graphData": [{ "position": number, "mentalEffort": 0-100, "label": "string" }]
    }`;

    // Запрос в формате Google AI
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nAnalyze this text: "${safeText}"` }]
        }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2
        }
      }),
    });

    const data = await response.json();

    // Обработка ошибок от Google
    if (data.error) {
      console.error("Google API Error Details:", data.error);
      throw new Error(`Gemini Error: ${data.error.message}`);
    }

    // В нативном API ответ лежит в candidates[0].content.parts[0].text
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error("Unexpected Data Structure:", JSON.stringify(data));
      throw new Error("Empty response from AI");
    }

    // Парсинг результата
    const analysis = JSON.parse(content.replace(/```json|```/g, "").trim());

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
