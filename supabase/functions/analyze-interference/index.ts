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
    const { l1, l2, taskCategory, contentArea } = await req.json();

    if (!l1 || !l2 || !contentArea) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: l1, l2, contentArea" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 2000);
    const safeL1 = sanitize(l1);
    const safeL2 = sanitize(l2);
    const safeCategory = sanitize(taskCategory || 'grammar');
    const safeContent = sanitize(contentArea);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are a Senior Applied Linguist and Language Transfer Expert. 
Task: Analyze semantic interference and transfer patterns between L1 (Native) and L2 (Target).

STRICT RULES:
1. Output MUST be ONLY valid JSON.
2. Bridges: Identify real "Positive Transfer" opportunities where L1 knowledge helps L2.
3. Pitfalls: Detail "Negative Interference" points (errors caused by L1 logic).
4. Decision Tree: Map the cognitive steps an L1 speaker takes that lead to a specific L2 outcome.
5. Evidence-Based: Focus on established linguistic differences (syntax, morphology, phonology).

JSON Structure:
{
  "bridges": [{ "l1Concept": "string", "l2Concept": "string", "type": "grammatical"|"lexical"|"phonetic", "transferType": "positive"|"neutral", "explanation": "string" }],
  "pitfalls": [{ "l1Pattern": "string", "l2Error": "string", "severity": "high"|"medium"|"low", "explanation": "string", "correction": "string" }],
  "falseFriends": [{ "l1Word": "string", "l2Word": "string", "l1Meaning": "string", "l2Meaning": "string" }],
  "decisionTree": [{ "step": number, "l1Logic": "string", "l2Result": "string", "isError": boolean }]
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
          { role: "user", content: `Analyze interference: L1:${safeL1}, L2:${safeL2}, Category:${safeCategory}, Topic:${safeContent}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
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
      console.error("JSON Parse Error:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(
      JSON.stringify({
        bridges: analysis.bridges || [],
        pitfalls: analysis.pitfalls || [],
        falseFriends: analysis.falseFriends || [],
        decisionTree: analysis.decisionTree || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-interference:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
