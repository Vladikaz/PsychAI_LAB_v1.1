import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    // Адаптивный поиск текста (как мы делали раньше)
    const rawText = body.text || body.content || body.textPassage || body.contentArea || body.words;
    
    if (!rawText) throw new Error("No text provided");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    const systemPrompt = `You are an expert in Cognitive Load Theory. 
Analyze text for ESL students and return ONLY valid JSON with this structure:
{
  "loadPoints": [{ "position": number, "word": "string", "load": 0-100, "reason": "string" }],
  "overallScore": number,
  "heatmapSegments": [{ "text": "string", "load": 0-100, "startIndex": number, "endIndex": number }],
  "scaffoldingAdvice": [{ "position": "string", "advice": "string", "priority": "high" }],
  "graphData": [{ "position": number, "mentalEffort": 0-100, "label": "string" }]
}`;

    // Используем твой проверенный URL
    const url = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    // Тот самый цикл автоповтора
    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nAnalyze this text: ${rawText}\n\nReturn JSON.` }] }]
        }),
      });

      if (response.status === 503) {
        attempts++;
        console.log(`Attempt ${attempts} for Cognitive Load failed with 503. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        break;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) throw new Error("Empty response from Gemini");

    // Твоя надежная очистка JSON
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Cognitive Load Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
