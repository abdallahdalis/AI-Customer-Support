import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import { OpenAI } from 'openai'; // Import OpenAI library for interacting with the OpenAI API

const systemPrompt = "You are an AI-Powered customer support bot for HeadstarterAI, a cutting-edge platform that facilitates AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users, including job seekers, recruiters, and hiring managers, by providing accurate, friendly, and concise support.";

export async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Initialize OpenAI client with API key

  try {
    const data = await req.json(); // Parse the JSON body of the incoming request

    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...data.messages, // Ensure you're spreading the correct messages array
      ],
      model: "gpt-4o-mini",
      stream: true,
    });

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content); // Encode the content to Uint8Array
              controller.enqueue(text); // Enqueue the encoded text to the stream
            }
          }
        } catch (error) {
          controller.error(error); // Handle any errors that occur during streaming
        } finally {
          controller.close(); // Close the stream when done
        }
      },
    });

    return new NextResponse(stream); // Return the stream as the response

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 }); // Return an error response if something goes wrong
  }
}