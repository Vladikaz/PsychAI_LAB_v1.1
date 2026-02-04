import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-id',
};

serve(async (req) => {
  // 1. ОБЯЗАТЕЛЬНАЯ обработка CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, target_language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // Та самая правильная ссылка, которую мы нашли
    const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash", // или gemini-2.0-flash
        messages: [
          { 
            role: "system", 
            content: "You are a specialized linguistic AI. Analyze the text and return valid JSON only." 
            // Тут должен быть специфичный промпт для каждой функции
          },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

    // Очистка ввода
    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 5000);
    const safeText = sanitize(textPassage);

    // Используем твой GEMINI_API_KEY, который ты прописал в секретах Supabase
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase secrets");
    }

    const systemPrompt = `You are a Cognitive Load Expert and Reading Complexity Analyst. 
Task: Analyze text for cognitive difficulty and mental effort.

STRICT RULES:
1. Output MUST be ONLY valid JSON.
2. Proportionality: If the input is a single sentence, provide a concise analysis. If the input is a long passage, provide detailed mapping.
3. No Fan-Fiction: Do not assume student background or external conditions. Focus only on the linguistic and cognitive properties of the provided text.
4. Heatmap: Create segments that cover the entire input text accurately.

JSON Structure:
{
  "loadPoints": [{ "position": number, "word": "string", "load": 0-100, "reason": "string" }],
  "overallScore": number (0-100),
  "heatmapSegments": [{ "text": "string", "load": 0-100, "startIndex": number, "endIndex": number }],
  "scaffoldingAdvice": [{ "position": "string", "advice": "string", "priority": "high"|"medium"|"low" }],
  "graphData": [{ "position": number, "mentalEffort": 0-100, "label": "string" }]
}`;

    // Используем официальный OpenAI-совместимый эндпоинт Google Gemini
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash", // Оптимальная модель для быстрого анализа
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this text: "${safeText}"` }
        ],
        response_format: { type: "json_object" }, // Принудительный JSON
        temperature: 0.3, // Снижаем креативность для точности
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Парсинг с очисткой (на случай, если модель все же добавит markdown-обертку)
    let analysis;
    try {
      const cleanContent = content.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch (e) {
      console.error("JSON Parse Error. Raw content:", content);
      throw new Error("Failed to parse AI response");
    }

    const result = {
      loadPoints: analysis.loadPoints || [],
      overallScore: analysis.overallScore ?? 50,
      heatmapSegments: analysis.heatmapSegments || [],
      scaffoldingAdvice: analysis.scaffoldingAdvice || [],
      graphData: analysis.graphData || [],
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-cognitive-load:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
