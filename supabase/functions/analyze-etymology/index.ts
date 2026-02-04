import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { words } = await req.json();

    if (!words || !words.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: words" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 2000);
    const safeWords = sanitize(words);

    // Используем прямой ключ Gemini
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are an Expert Etymologist and Historical Linguist. 
Task: Trace word origins and identify cognates across languages to aid language acquisition.

STRICT RULES:
1. Response MUST be ONLY valid JSON.
2. Evidence-Based: Trace only to verifiable linguistic roots (Latin, Greek, Proto-Indo-European, etc.).
3. Proportionality: Provide concise connections for simple words and deeper etymological trees for complex vocabulary.
4. Cognates: Include 3-5 major languages (e.g., German, French, Spanish, Russian, Italian) to show cross-linguistic patterns.

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
          { role: "user", content: `Analyze etymology and cognates for: "${safeWords}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Минимальная температура для точности фактов
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let analysis;
    try {
      const cleanContent = content.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse JSON:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    const result = {
      connections: analysis.connections || [],
      rootGroups: analysis.rootGroups || [],
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-etymology:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
