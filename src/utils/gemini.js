import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateCaption = async (imageBase64, apiKey) => {
    if (!apiKey) {
        return "Please enter your Gemini API Key to get a caption!";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Remove the data URL prefix if present
        const base64Data = imageBase64.split(',')[1] || imageBase64;

        // Get browser language
        const lang = navigator.language || 'en-US';

        const prompt = `Generate a short, warm, handwritten-style blessing or nice comment about this photo. Keep it under 15 words. The language must be ${lang}. Do not include quotes.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error generating caption:", error);
        return "Error generating caption. Check console.";
    }
};
