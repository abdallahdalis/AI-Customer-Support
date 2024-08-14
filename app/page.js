"use client"; // Mark this file as a Client Component

import { Box, Button, Stack, TextField } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import "./globals.css"; // Ensure this import is present
import { handleSignOut } from "./firebase"; // Import the handleSignOut function
import { auth } from "./firebase"; // Import the auth object
import { getIdToken } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchMessages = async () => {
      console.log("Checking auth and fetching messages");

      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          console.log("User not authenticated");
          router.push("/signin"); // Redirect to sign-in if not authenticated
          return;
        }

        try {
          const idToken = await getIdToken(user);
          console.log("User authenticated with ID token:", idToken);

          const response = await fetch("/api/chat", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }

          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      });
    };

    checkAuthAndFetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const user = auth.currentUser;

    if (user) {
      const idToken = await getIdToken(user);
      const newMessages = [...messages, { role: "user", content: message }];
      setMessages(newMessages); // Set initial user message

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = "";

        setMessages((messages) => [
          ...messages,
          { role: "assistant", content: result },
        ]);

        const processText = async ({ done, value }) => {
          if (done) {
            console.log("Final result:", result); // Log final result
            return;
          }
          const text = decoder.decode(value || new Uint8Array(), {
            stream: true,
          });
          result += text;

          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ];
          });

          return reader.read().then(processText);
        };

        await reader.read().then(processText);

        // Now save the conversation
        const allMessages = [
          ...newMessages,
          { role: "assistant", content: result },
        ];
        await fetch("/api/save-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ messages: allMessages }),
        });
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "radial-gradient(circle, #B0B0B0 0%, #000000 100%)",
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
        }}
        onClick={handleSignOut}
      >
        Logout
      </Button>
      <Stack
        direction={"column"}
        width="800px"
        height="700px"
        p={2}
        spacing={1}
      >
        <Stack
          direction={"column"}
          spacing={1}
          flexGrow={1}
          padding={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            overflow: "auto",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "0.4em",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                <Markdown>{message.content}</Markdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2} paddingLeft={1} paddingRight={3}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="text-field"
            color="primary"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
