const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in env.');
    return;
  }
  
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    console.log('Listing available models for your API key...');
    // listModels is not directly exposed on new GoogleGenerativeAI in some versions,
    // let's fetch directly from the Google API to see list of models!
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log('Supported models found:');
      data.models.forEach(m => {
        console.log(`- Name: ${m.name}, Display: ${m.displayName}, Supported Actions: ${m.supportedGenerationMethods.join(', ')}`);
      });
    } else {
      console.log('No models returned. API Response:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('General error:', err);
  }
}

test();
