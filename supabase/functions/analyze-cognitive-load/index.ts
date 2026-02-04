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
    const { textPassage } = await req.json();

    // Validate inputs
    if (!textPassage || !textPassage.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required field: textPassage" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 5000);
    const safeText = sanitize(textPassage);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Cognitive Load Expert and Reading Complexity Analyst. Your task is to analyze text for cognitive difficulty and mental effort required.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no text before or after the JSON.

The JSON structure must be exactly:
{
  "loadPoints": [
    {
      "position": number (word position in text, starting at 1),
      "word": "string - the challenging word",
      "load": number (0-100, cognitive difficulty score),
      "reason": "string - why this word/phrase is challenging"
    }
  ],
  "overallScore": number (0-100, overall text complexity),
  "heatmapSegments": [
    {
      "text": "string - segment of text (phrase or sentence)",
      "load": number (0-100),
      "startIndex": number (character start position),
      "endIndex": number (character end position)
    }
  ],
  "scaffoldingAdvice": [
    {
      "position": "string - where in the text (e.g., 'Opening sentence', 'Paragraph 2')",
      "advice": "string - specific teaching recommendation",
      "priority": "high" | "medium" | "low"
    }
  ],
  "graphData": [
    {
      "position": number (sequential position for graphing),
      "mentalEffort": number (0-100),
      "label": "string - short label for this data point"
    }
  ]
}

Analyze sentence complexity, vocabulary difficulty, syntactic density, and abstract concepts.
Create heatmap segments that cover the entire input text.
Provide actionable scaffolding advice for teachers.`;

    const userPrompt = `Analyze the cognitive load of this text passage:

"${safeText}"

Identify complexity hotspots, calculate mental effort scores, segment the text for heatmap visualization, and provide scaffolding recommendations for teachers.`;

    console.log(`Analyzing cognitive load for text: ${safeText.slice(0, 100)}...`);

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
      loadPoints: analysis.loadPoints || [],
      overallScore: analysis.overallScore ?? 50,
      heatmapSegments: analysis.heatmapSegments || [],
      scaffoldingAdvice: analysis.scaffoldingAdvice || [],
      graphData: analysis.graphData || [],
    };

    console.log("Cognitive load analysis complete:", JSON.stringify(result).slice(0, 200));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-cognitive-load:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
