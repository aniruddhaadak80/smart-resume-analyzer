'use server';

import { SarvamAIClient } from 'sarvamai';

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY as string,
});

export async function transcribeAudio(formData: FormData) {
    try {
        const file = formData.get('audio') as File;
        if (!file) {
            throw new Error('No audio file provided');
        }

        const sarvamFormData = new FormData();
        sarvamFormData.append("file", file);
        sarvamFormData.append("model", "saaras:v3");

        const response = await fetch("https://api.sarvam.ai/speech-to-text-translate", {
            method: "POST",
            headers: {
                "api-subscription-key": process.env.SARVAM_API_KEY || "",
            },
            body: sarvamFormData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Sarvam STT Error");
        }

        return { success: true, text: data.transcript || data.output || "No transcription found" };

    } catch (error: any) {
        console.error('Transcription error:', error);
        return { success: false, error: error.message || 'Transcription failed' };
    }
}

export async function generateCoachResponse(history: { role: 'user' | 'assistant' | 'system', content: string }[]) {
    try {
        // casting history to any to bypass potential SDK type mismatches if they are strict about 'ChatCompletionRequestMessage'
        const response = await client.chat.completions({
            messages: history as any,
            // model property removed as it caused build error and is not in JS SDK types
        });

        return {
            success: true,
            content: response.choices[0].message.content
        };

    } catch (error: any) {
        console.error('Chat error:', error);
        return { success: false, error: error.message || 'Chat generation failed' };
    }
}
