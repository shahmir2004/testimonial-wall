// api/ai/summarize-public.js
import { InferenceClient } from "@huggingface/inference";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("--- Starting summarize-public function ---");

    const hfApiKey = process.env.TSW_HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      throw new Error('Server Config Error: Missing TSW_HUGGINGFACE_API_KEY.');
    }

    const { text } = req.body;
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Initializing Hugging Face client...");
    const hf = new InferenceClient(hfApiKey);

    console.log("Calling Hugging Face summarization API...");
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text,
    });
    console.log("Received response from Hugging Face.");

    const summary = result.summary_text;
    if (!summary) {
      throw new Error('AI failed to produce a valid summary.');
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Critical Error in summarize-public function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}