'use client'; // Mark this file as a Client Component

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import './globals.css'; // Ensure this import is present

export default function Home() {
  // State to hold the list of messages in the chat
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);

  // State to hold the current input message from the user
  const [message, setMessage] = useState('');

  // State to manage the loading state when sending a message
  const [isLoading, setIsLoading] = useState(false);

  // Function to send the user's message to the server
  const sendMessage = async () => {
    // Prevent sending an empty or multiple messages while already loading
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
  
    // Update the messages state with the user's message and a placeholder for the assistant's reply
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
  
    try {
      // Send the message to the server via a POST request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });
  
      // Check for network errors
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
  
      // Function to process the text chunks from the response
      const processText = async ({ done, value }) => {
        if (done) {
          console.log("Final result:", result); // Log final result
          return;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        result += text;
  
        // Update the assistant's message with the new text chunk
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
  
    } catch (error) {
      // Log any errors that occur during the fetch request
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };
  
  // Function to handle Enter key press to send the message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter key press
      sendMessage(); // Call the sendMessage function
    }
  };

  // Ref to manage scrolling to the bottom of the chat
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Use effect to scroll to the bottom whenever the messages change
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
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="text-field" // Apply the CSS class here
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}