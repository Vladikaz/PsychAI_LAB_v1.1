import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  // Обработка CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    
    // Извлекаем поля, специфичные для интерференции
    const l1 = body.l1 || 'Russian';
    const l2 = body.l2 || 'English';
    const taskCategory = body.taskCategory || body.category || 'grammar';
    const contentArea = body.contentArea || body.text || body.content || body.textPassage || "";

    if (!contentArea) throw new Error("No content provided for interference analysis");

    // Санитайзер
    const sanitize = (val: string) => (val || '').replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 3000);
    
    const safeL1 = sanitize(l1);
    const safeL2 = sanitize(l2);
    const safeCategory = sanitize(taskCategory);
    const safeContent = sanitize(contentArea);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");

    const systemPrompt = `You are a Senior Applied Linguist and Language Transfer Expert. 
Task: Analyze semantic interference and transfer patterns between L1 (Native) and L2 (Target).
STRICT RULES:
1. Output MUST be ONLY valid JSON.
2. Bridges: Identify "Positive Transfer" opportunities.
3. Pitfalls: Detail "Negative Interference" points (errors caused by L1 logic).
4. Decision Tree: Map the cognitive steps an L1 speaker takes.

JSON Structure:
{
  "bridges": [{ "l1Concept": "string", "l2Concept": "string", "type": "grammatical"|"lexical", "transferType": "positive", "explanation": "string" }],
  "pitfalls": [{ "l1Pattern": "string", "l2Error": "string", "severity": "high"|"medium"|"low", "explanation": "string", "correction": "string" }],
  "falseFriends": [{ "l1Word": "string", "l2Word": "string", "l1Meaning": "string", "l2Meaning": "string" }],
  "decisionTree": [{ "step": number, "l1Logic": "string", "l2Result": "string", "isError": boolean }]
}`;

    // Тот самый рабочий URL из твоего кода
    const url = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    // Цикл автоповтора при 503
    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: `${systemPrompt}\n\nAnalyze interference: L1:${safeL1}, L2:${safeL2}, Category:${safeCategory}, Topic:${safeContent}\n\nReturn JSON.` }] 
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.3
          }
        }),
      });

      if (response.status === 503) {
        attempts++;
        console.log(`Interference Attempt ${attempts} failed with 503. Retrying...`);
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

    // Надежная очистка JSON
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Interference Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
