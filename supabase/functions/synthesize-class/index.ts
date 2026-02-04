import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // АДАПТАЦИЯ: Ищем данные в поле student_portraits, которое прислал фронтенд
    const portraits = body.student_portraits || body.observations || (Array.isArray(body) ? body : null);

    if (!portraits || !Array.isArray(portraits) || portraits.length === 0) {
      console.error("Wrong format. Received:", JSON.stringify(body));
      throw new Error("No student portraits provided or wrong format");
    }

    // Собираем портреты в один текст для анализа атмосферы класса
    const analysisInput = portraits
      .map((p: any, i: number) => `Student ${i + 1} (${p.tag || 'No tag'}): ${p.portrait || JSON.stringify(p)}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an expert Educational Psychologist and Classroom Consultant. 
Your task is to analyze these individual student portraits and synthesize them into a "Classroom Insight" report for the class: "${body.class_name || 'General Class'}".

CRITICAL ANALYSIS RULES:
1. Identify the collective emotional climate based on these portraits.
2. Spot potential social friction (e.g., oppositional students vs. introverted students).
3. Provide 4 concrete strategies for the teacher to manage this specific mix of personalities.
4. Maintain academic rigor and pedagogical focus. If the input is minimal (e.g., student is sad), provide a concise, factual summary without psychological fan-fiction. Your output length should be proportional to the input detail, unless enough data is given. Do not assume underlying conditions, unless provided with enough data or having visible patterns.

You MUST respond with a JSON object containing exactly these fields:
- class_mood: A 2-3 word descriptor of the current class atmosphere.
- key_patterns: A list of the most frequent behaviors or personality traits observed in this group.
- group_dynamics: A detailed analysis of how these specific students (introverts, dominant types, etc.) likely interact as a whole (150-300 words).
- recommendations: Exactly 4 actionable strategies for the teacher to improve the learning environment.`;

    const url = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `${systemPrompt}\n\nStudent Data for Synthesis:\n${analysisInput}\n\nReturn ONLY raw JSON.` 
            }] 
          }]
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
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Synthesis Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
