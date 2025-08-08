exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Dynamically import the ES Module
        const { GoogleGenerativeAI } = await import('@google/genai');

        // The API key is accessed from Netlify's environment variables
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
             return { statusCode: 400, body: JSON.stringify({ error: "No prompt provided." }) };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ text })
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error in proxy function." })
        };
    }
}
