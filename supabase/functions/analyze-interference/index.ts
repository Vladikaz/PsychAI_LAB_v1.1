import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ... (начало кода такое же)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    
    // Пытаемся достать текст из всех возможных полей, которые может прислать фронтенд
    const text = body.text || body.content || body.textPassage || body.contentArea;
    
    if (!text) {
      console.error("Received body:", JSON.stringify(body)); // Увидим в логах, что пришло
      throw new Error("No text provided in any known field (text, content, textPassage, contentArea)");
    }

    const safeText = text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 5000);

    // ... (дальше запрос к Gemini без изменений)
    // Функция очистки ввода
    const sanitize = (val: string) => (val || '').replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 2000);
    
    const safeL1 = sanitize(l1 || 'Russian');
    const safeL2 = sanitize(l2 || 'English');
    const safeCategory = sanitize(taskCategory || 'grammar');
    const safeContent = sanitize(contentArea || '');

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are a Senior Applied Linguist and Language Transfer Expert. 
Task: Analyze semantic interference and transfer patterns between L1 (Native) and L2 (Target).

STRICT RULES:
1. Output MUST be ONLY valid JSON.
2. Bridges: Identify "Positive Transfer" opportunities.
3. Pitfalls: Detail "Negative Interference" points (errors caused by L1 logic).
4. Decision Tree: Map the cognitive steps an L1 speaker takes.

JSON Structure:
{
  "bridges": [{ "l1Concept": "string", "l2Concept": "string", "type": "grammatical"|"lexical"|"phonetic", "transferType": "positive", "explanation": "string" }],
  "pitfalls": [{ "l1Pattern": "string", "l2Error": "string", "severity": "high"|"medium"|"low", "explanation": "string", "correction": "string" }],
  "falseFriends": [{ "l1Word": "string", "l2Word": "string", "l1Meaning": "string", "l2Meaning": "string" }],
  "decisionTree": [{ "step": number, "l1Logic": "string", "l2Result": "string", "isError": boolean }]
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
          { role: "user", content: `Analyze interference: L1:${safeL1}, L2:${safeL2}, Category:${safeCategory}, Topic:${safeContent}` }
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

    if (!content) throw new Error("No content in AI response");

    const cleanContent = content.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Error in analyze-interference:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
