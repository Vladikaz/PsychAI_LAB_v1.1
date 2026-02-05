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

    // СИНХРОНИЗАЦИЯ: Берем именно те поля, которые шлет ClassView.tsx
    const className = body.class_name || "General Class";
    const portraits = body.student_portraits || [];

    if (portraits.length === 0) {
      throw new Error("No student portraits provided for synthesis");
    }

    // Форматируем входные данные для ИИ
    const analysisInput = portraits
      .map((p: any) => `Student ID ${p.student_id} (${p.tag}): ${p.portrait}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an expert Educational Psychologist. Your task is to analyze these individual student portraits and synthesize them into a "Classroom Insight" report for the class. 
Analyze these student portraits for the class: "${className}".
Synthesize a comprehensive "Classroom Insight" report.

CRITICAL ANALYSIS RULES:
1. Identify the collective emotional climate based on these portraits.
2. Spot potential social friction (e.g., oppositional students vs. introverted students).
3. Provide 4 concrete strategies for the teacher to manage this specific mix of personalities.
4. Maintain academic rigor and pedagogical focus. If the input is minimal (e.g., student is sad), provide a concise, factual summary without psychological fan-fiction. Your output length should be proportional to the input detail, unless enough data is given. Do not assume underlying conditions, unless provided with enough data or having visible patterns.


You MUST respond with a JSON object containing exactly these fields:
- class_mood: 2-3 words describing the atmosphere.
- group_dynamics: A detailed psychological analysis (150-300 words).
- recommendations: Exactly 4 actionable strategies.
- summary: A BEAUTIFULLY FORMATTED MARKDOWN STRING combining all findings. This is the main text for the teacher.`;

    // Используем проверенный v1alpha URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
              text: `${systemPrompt}\n\nData for Synthesis:\n${analysisInput}\n\nReturn JSON. Ensure "summary" field contains the full formatted report in Markdown.` 
            }] 
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.3
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

    // Очистка и отправка
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return new Response(JSON.stringify(result), { 
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
