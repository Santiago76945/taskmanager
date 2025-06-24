// /.netlify/functions/chatgpt.js

import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async (event) => {
    try {
        const { messages } = JSON.parse(event.body);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });

        return {
            statusCode: 200,
            body: JSON.stringify(completion.choices[0].message),
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
