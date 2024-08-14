import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin"; // Adjust the path accordingly

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
  console.log("POST request received to save messages");

  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = decodedToken.uid;
  console.log("User authenticated with ID:", userId);

  try {
    const data = await req.json();
    console.log("Received data to save:", data);

    if (!Array.isArray(data.messages)) {
      throw new Error("Invalid data format: messages should be an array");
    }

    // Update the messages in Firestore
    const userDoc = adminDb.collection("Messages").doc(userId);
    await userDoc.set(
      {
        messages: data.messages,
      },
      { merge: true }
    );

    return new NextResponse("Messages saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
