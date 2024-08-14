import { NextResponse } from "next/server";
import { Configuration, OpenAI } from "openai";

// Define the system prompt for the AI model
const systemPrompt =
  "You are an AI-Powered customer support bot for HeadstarterAI, a cutting-edge platform that facilitates AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users, including job seekers, recruiters, and hiring managers, by providing accurate, friendly, and concise support. Reply with properly formatted Markdown.";

// Handle POST requests to this API route
export async function POST(req) {
  // Initialize OpenAI client with API key from environment variables
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Parse the incoming request body as JSON
    const data = await req.json();
    console.log("Received data:", data); // Log the received data for debugging

    // Validate that the 'messages' field is an array
    if (!Array.isArray(data.messages)) {
      throw new Error("Invalid data format: messages should be an array");
    }

    // Create a chat completion request to OpenAI's API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt, // Include the system prompt in the messages
        },
        ...data.messages, // Add the user-provided messages to the request
      ],
      model: "gpt-4o-mini", // Specify the model to use
      stream: true, // Enable streaming responses
    });

    // Create a ReadableStream to handle the streamed response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder(); // Encoder to convert text to Uint8Array
        try {
          // Iterate over each chunk of the streamed response
          for await (const chunk of completion) {
            // Extract the content from the chunk
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              // Encode the content and enqueue it into the stream
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (error) {
          // Handle errors during streaming
          controller.error(error);
        } finally {
          // Close the stream when done
          controller.close();
        }
      },
    });

    // Return the stream as the response
    return new NextResponse(stream);
  } catch (error) {
    // Log any errors that occur and return a 500 Internal Server Error response
    console.error("API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
