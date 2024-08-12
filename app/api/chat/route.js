import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const systemPrompt =
  "You are an AI-Powered customer support bot for HeadstarterAI, a cutting-edge platform that facilitates AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users, including job seekers, recruiters, and hiring managers, by providing accurate, friendly, and concise support.";

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();
  const completion = await openai.chat.completion.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
  return new NextReponse(stream);
}
