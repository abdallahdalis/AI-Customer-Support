import { NextResponse } from "next/server";
import { Configuration, OpenAI } from "openai";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin"; // Adjust the path accordingly

const systemPrompt =
  "You are an AI-Powered customer support bot for HeadstarterAI, a cutting-edge platform that facilitates AI-powered interviews for software engineering (SWE) jobs. Your role is to assist users, including job seekers, recruiters, and hiring managers, by providing accurate, friendly, and concise support. Reply with properly formatted Markdown.";

async function verifyToken(req) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

export async function POST(req) {
  console.log("POST request received");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = decodedToken.uid;
  console.log("User authenticated with ID:", userId);

  try {
    const data = await req.json();
    console.log("Received data:", data);

    if (!Array.isArray(data.messages)) {
      throw new Error("Invalid data format: messages should be an array");
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      model: "gpt-4o-mini",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req) {
  console.log("GET request received");

  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = decodedToken.uid;
  console.log("User authenticated with ID:", userId);

  try {
    const userDoc = adminDb.collection("Messages").doc(userId);
    const docSnap = await userDoc.get();

    if (!docSnap.exists) {
      return new NextResponse(
        JSON.stringify({
          messages: [
            {
              role: "assistant",
              content:
                "Hi! I'm the Headstarter support assistant. How can I help you today?",
            },
          ],
        }),
        { status: 200 }
      );
    }

    const messages = docSnap.data().messages;
    return new NextResponse(JSON.stringify({ messages }), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
