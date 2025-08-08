exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: "No prompt provided." }) };
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        // If the response from Google is not OK, we will now pass the specific error back
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API Error:", errorBody);
            // Return a more specific error message to the game client
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API Error: ${errorBody.error.message}` })
            };
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: generatedText })
        };

    } catch (error) {
        console.error("Function execution error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Internal Server Error: ${error.message}` })
        };
    }
}
