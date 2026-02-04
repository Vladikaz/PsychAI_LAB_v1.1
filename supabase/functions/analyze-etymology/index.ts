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
    // Получаем текст из запроса
    const { text } = await req.json();
    if (!text) throw new Error("No text provided");

    // Очистка ввода от инъекций и ограничение длины
    const safeText = text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 3000);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are an Expert Etymologist and Historical Linguist. 
Task: Trace word origins and identify cognates across languages to aid language acquisition.

STRICT RULES:
1. Response MUST be ONLY valid JSON.
2. Evidence-Based: Trace only to verifiable linguistic roots (Latin, Greek, Proto-Indo-European, etc.).
3. Cognates: Include 3-5 major languages (e.g., German, French, Spanish, Russian, Italian).

JSON Structure:
{
  "connections": [
    {
      "id": "string",
      "word": "string",
      "root": "string",
      "rootLanguage": "string",
      "cognates": [{ "language": "string", "word": "string" }],
      "meaning": "string"
    }
  ],
  "rootGroups": [
    {
      "root": "string",
      "meaning": "string",
      "words": ["string"]
    }
  ]
}`;

    // Запрос к Gemini
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
          { role: "user", content: `Analyze etymology and cognates for: "${safeText}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    // Парсинг и очистка JSON
    const cleanContent = content.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Error in analyze-etymology:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
