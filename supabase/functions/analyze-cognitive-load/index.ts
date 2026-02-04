import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // 1. Обработка CORS preflight (чтобы браузер не блокировал запрос)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { text } = await req.json();
    
    // Очистка и проверка ввода
    if (!text) throw new Error("No text provided");
    const safeText = text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 5000);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are a Cognitive Load Expert and Reading Complexity Analyst. 
Task: Analyze text for cognitive difficulty and mental effort.
STRICT RULES:
1. Output MUST be ONLY valid JSON.
2. Proportionality: If input is short, be concise. If long, provide detailed mapping.
3. Heatmap: Create segments that cover the entire input text accurately.

JSON Structure:
{
  "loadPoints": [{ "position": number, "word": "string", "load": 0-100, "reason": "string" }],
  "overallScore": number,
  "heatmapSegments": [{ "text": "string", "load": 0-100, "startIndex": number, "endIndex": number }],
  "scaffoldingAdvice": [{ "position": "string", "advice": "string", "priority": "high"|"medium"|"low" }],
  "graphData": [{ "position": number, "mentalEffort": 0-100, "label": "string" }]
}`;

    // Запрос к Gemini через OpenAI-совместимый путь
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this text: "${safeText}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty response from AI");

    // Парсинг результата (убираем возможные markdown-метки ```json)
    const cleanContent = content.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
