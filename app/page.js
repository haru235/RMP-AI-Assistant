"use client";

import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can I help you taday?",
    },
  ]);
  const [message, setMessage] = useState("");

  const test = async () => {
    const url = 'https://www.ratemyprofessors.com/professor/83573'
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({url: url, max: 5}),
    }).then(async (res) => {

    });
  };

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        backgroundColor: "background.default",
      }}
    >
      <Stack
        sx={{
          width: { xs: "100%", sm: "500px" }, // Improved responsiveness
          maxWidth: "100%",
          height: "700px",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          boxShadow: 3,
          backgroundColor: "background.paper", // Consistent with theme
        }}
      >
        <Stack
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            spacing: 2,
            padding: 1, // Added padding for better spacing
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "assistant" ? "flex-start" : "flex-end",
                mt: 1, // Added margin for better spacing between messages
              }}
            >
              <Box
                sx={{
                  bgcolor:
                    message.role === "assistant"
                      ? "primary.main"
                      : "secondary.main",
                  color: "white",
                  borderRadius: 2,
                  p: 2,
                  maxWidth: "70%",
                  overflowWrap: "break-word",
                  boxShadow: 2, // Added shadow for a more polished look
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: ({ node, ...props }) => (
                      <Box component="ul" sx={{ pl: 4, mb: 1 }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <Box component="ol" sx={{ pl: 4, mb: 1 }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <Box component="li" sx={{ mb: 0.5 }} {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ backgroundColor: "background.paper" }} // Consistent input background
          />
          <Button
            variant="contained"
            size="large"
            sx={{ whiteSpace: "nowrap", flexShrink: 0 }} // Ensured the button doesn't shrink
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        size="large"
        sx={{ whiteSpace: "nowrap", flexShrink: 0 }} // Ensured the button doesn't shrink
        onClick={test}
      >
        Test
      </Button>
    </Box>
  );
}
