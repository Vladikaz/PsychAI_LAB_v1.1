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
    
    // Твоя "всеядная" логика поиска текста
    const rawText = body.text || body.content || body.textPassage || body.contentArea || body.words;
    
    if (!rawText) throw new Error("No text provided for etymological analysis");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");

    const systemPrompt = `You are an Expert Etymologist and Historical Linguist. 
Task: Trace word origins and identify cognates across languages.
STRICT RULES:
1. Response MUST be ONLY valid JSON.
2. Evidence-Based: Trace only to verifiable linguistic roots.
3. Cognates: Include 3-5 major languages (German, French, Spanish, Russian, Italian).

JSON Structure:
{
  "connections": [{ "id": "string", "word": "string", "root": "string", "rootLanguage": "string", "cognates": [{"language": "string", "word": "string"}], "meaning": "string" }],
  "rootGroups": [{ "root": "string", "meaning": "string", "words": ["string"] }]
}`;

    // Тот самый "золотой" URL из рабочего кода
    const url = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    // Цикл автоповтора при ошибке 503 (Service Unavailable)
    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: `${systemPrompt}\n\nAnalyze etymology and cognates for: "${rawText}"\n\nReturn JSON.` }] 
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2
          }
        }),
      });

      if (response.status === 503) {
        attempts++;
        console.log(`Etymology Attempt ${attempts} failed with 503. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Ждем 1.5 сек
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

    // Твоя надежная очистка JSON от Markdown-разметки
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Etymology Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
