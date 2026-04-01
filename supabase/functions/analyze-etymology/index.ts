import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const rawText = body.text || body.content || body.textPassage || body.contentArea || body.words;
    
    if (!rawText) throw new Error("No text provided for etymological analysis");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // INTEGRATED CASCADING ANCESTRY PROMPT
    const systemPrompt = `You are a Senior Historical Linguist and Etymologist. 
Task: Trace the "Ontological Ancestry" of the provided word using a temporal hierarchy.

STRICT RULES:
1. TEMPORAL FLOW: Identify the Primary Ancient Seed (e.g. PIE), then Intermediate Proto-Branches (e.g. Proto-Germanic), then Modern Cognates.
2. NO HALLUCINATION: If a root is "Pre-Greek," "Substrate," or "Unknown," label it as such. Do not invent a PIE root.
3. RESPONSE FORMAT: Return ONLY valid JSON. No markdown.

JSON Structure:
{
  "ancient_seed": { 
    "form": "string (with asterisk for reconstructions)", 
    "language": "string", 
    "meaning": "string", 
    "color_token": "seed" 
  },
  "intermediate_branches": [
    { "form": "string", "language": "string", "century": "string", "color_token": "branch" }
  ],
  "modern_relatives": [
    { "word": "string", "lang": "string", "connection": "string", "color_token": "modern" }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: `${systemPrompt}\n\nAnalyze the chronological etymology for: "${rawText}"` }] 
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1 // Kept low for high precision and PIE accuracy
          }
        }),
      });

      if (response.status === 503) {
        attempts++;
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

    // Clean and Parse
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
