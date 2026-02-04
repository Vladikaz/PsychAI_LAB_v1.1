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

    // Validate inputs
    if (!words || !words.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: words" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 2000);
    const safeWords = sanitize(words);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an Expert Etymologist and Historical Linguist. Your task is to trace word origins and identify cognates across languages.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no text before or after the JSON.

The JSON structure must be exactly:
{
  "connections": [
    {
      "id": "string - unique id like word_1",
      "word": "string - the analyzed word",
      "root": "string - the etymological root",
      "rootLanguage": "string - origin language (Latin, Greek, Proto-Germanic, etc.)",
      "cognates": [
        {
          "language": "string - language name",
          "word": "string - cognate word in that language"
        }
      ],
      "meaning": "string - original root meaning"
    }
  ],
  "rootGroups": [
    {
      "root": "string - the shared root",
      "meaning": "string - what the root means",
      "words": ["string - words sharing this root"]
    }
  ]
}

For cognates, include 3-5 languages per word (e.g., German, French, Spanish, Russian, Italian, Portuguese, Dutch).
Group words by shared roots when applicable.`;

    const userPrompt = `Analyze the etymology and find cognates for these words:
${safeWords}

Trace each word to its linguistic root, identify the root language, and find cognates in other major languages.`;

    console.log(`Analyzing etymology for: ${safeWords.slice(0, 100)}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let analysis;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysis = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Ensure all required fields exist with defaults
    const result = {
      connections: analysis.connections || [],
      rootGroups: analysis.rootGroups || [],
    };

    console.log("Etymology analysis complete:", JSON.stringify(result).slice(0, 200));

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
