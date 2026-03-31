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

const systemPrompt = `You are an Expert Etymologist. 
Task: Trace words to their earliest verifiable Proto-roots.

STRICT RULES:
1. Response MUST be ONLY valid JSON.
2. Root Language: Always use full descriptive names (e.g., "Proto-Indo-European", "Proto-Germanic", "Old Norse"). This is CRITICAL for UI coloring.
3. Cognates: Include 4-6 cognates. Prioritize variety across different modern branches (e.g., if the root is PIE, show one Germanic, one Romance, one Slavic, etc.).
4. Evidence: Only return linguistically accepted reconstructions (use the * asterisk for reconstructed forms).
5. Language Family Integrity: Before analyzing, identify the language family of the input word. Do not attempt to map Sino-Tibetan (Chinese), Afroasiatic (Arabic/Hebrew), or other non-Indo-European words to Proto-Indo-European roots. If the word is from a different family, trace it to its own respective ancestor (e.g., Old Chinese or Proto-Semitic).
6. Refuse Hallucinations: If you cannot find 4 verifiable cognates, return only the ones that are 100% certain. Quality over quantity.

JSON Structure:
{
  "connections": [{ 
    "id": "string", 
    "word": "string", 
    "root": "string", 
    "rootLanguage": "string", 
    "cognates": [{"language": "string", "word": "string"}], 
    "meaning": "string" 
  }],
  "rootGroups": [{ "root": "string", "meaning": "string", "words": ["string"] }]
}`;
    // Тот самый "золотой" URL из рабочего кода
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

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
