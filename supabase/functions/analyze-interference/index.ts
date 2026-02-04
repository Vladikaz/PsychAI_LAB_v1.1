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

    // Validate inputs
    if (!l1 || !l2 || !contentArea) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: l1, l2, contentArea" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs to prevent prompt injection
    const sanitize = (text: string) => text.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, '').slice(0, 2000);
    const safeL1 = sanitize(l1);
    const safeL2 = sanitize(l2);
    const safeCategory = sanitize(taskCategory || 'grammar');
    const safeContent = sanitize(contentArea);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Senior Applied Linguist and Language Transfer Expert. Your task is to analyze semantic interference patterns between a native language (L1) and a target language (L2).

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no text before or after the JSON.

The JSON structure must be exactly:
{
  "bridges": [
    {
      "l1Concept": "string - the L1 pattern/concept",
      "l2Concept": "string - the equivalent L2 pattern/concept", 
      "type": "grammatical" | "lexical" | "phonetic",
      "transferType": "positive" | "neutral",
      "explanation": "string - why this is a positive transfer bridge"
    }
  ],
  "pitfalls": [
    {
      "l1Pattern": "string - the L1 pattern that causes interference",
      "l2Error": "string - the resulting error in L2",
      "severity": "high" | "medium" | "low",
      "explanation": "string - why this interference occurs",
      "correction": "string - how to correct/avoid this error"
    }
  ],
  "falseFriends": [
    {
      "l1Word": "string - word in L1",
      "l2Word": "string - similar word in L2",
      "l1Meaning": "string - what it means in L1",
      "l2Meaning": "string - what it actually means in L2"
    }
  ],
  "decisionTree": [
    {
      "step": 1,
      "l1Logic": "string - how L1 speaker thinks",
      "l2Result": "string - what they produce in L2",
      "isError": true | false
    }
  ]
}

Provide 2-4 items for each array. Focus on the specific content area provided. Be accurate and educational.`;

    const userPrompt = `Analyze the semantic interference between:
- L1 (Native Language): ${safeL1}
- L2 (Target Language): ${safeL2}
- Task Category: ${safeCategory}
- Content/Topic: ${safeContent}

Identify bridges (positive transfer), pitfalls (negative interference), false friends (lexical traps), and create a decision tree showing how L1 logic leads to L2 output.`;

    console.log(`Analyzing interference: ${safeL1} -> ${safeL2}, category: ${safeCategory}`);

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

    // Parse the JSON response, handling potential markdown wrapping
    let analysis;
    try {
      // Remove markdown code blocks if present
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
      bridges: analysis.bridges || [],
      pitfalls: analysis.pitfalls || [],
      falseFriends: analysis.falseFriends || [],
      decisionTree: analysis.decisionTree || [],
    };

    console.log("Analysis complete:", JSON.stringify(result).slice(0, 200));

    return new Response(
      JSON.stringify(result),
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
