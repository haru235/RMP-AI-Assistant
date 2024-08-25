'use client';

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Markdown from 'markdown-to-jsx';

export default function Home() {

  const renderRecommendation = (recommendation) => (
    <Box
      key={recommendation.prof}
      sx={{
        mb: 2,
        p: 2,
        border: '1px solid',
        borderRadius: 1,
        backgroundColor: '#f9f9f9'
      }}>
      <Markdown options={{ forceBlock: true }}>
        {`**Professor:** ${recommendation.prof}\n\n` +
          `**Subject:** ${recommendation.subject}\n\n` +
          `**Course:** ${recommendation.course}\n\n` +
          `**School:** ${recommendation.school}\n\n` +
          `**Date:** ${recommendation.date}\n\n` +
          `**Rating:** ${recommendation.stars} / 5\n\n` +
          `**Brief Review/Description:** ${recommendation.review}`}
      </Markdown>
    </Box>
  );

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [professorUrl, setProfessorUrl] = useState("");

  const processProfessorUrls = async () => {
    const urls = [];
    professorUrl.split('\n').forEach((url, _) => {
      if (url.startsWith('https://www.ratemyprofessors.com/professor/')) {
        urls.push(url);
      } else {
        console.log('Invalid Url: ', url);
      }
    });
    setProfessorUrl('');
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: urls, max: 5 }),
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
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        backgroundColor: "background.default",
      }}
    >
      <Stack
        sx={{
          width: { xs: "100%", sm: "500px" },
          maxWidth: "100%",
          height: "700px",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          boxShadow: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Stack
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            spacing: 2,
            padding: 1,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "assistant" ? "flex-start" : "flex-end",
                mt: 1,
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
                  boxShadow: 2,
                }}
              >
                {message.content.includes('Recommended professors based on your preferences:') ? (
                  <>
                    {message.content
                      .split('Recommended professors based on your preferences:')[1]
                      .trim()
                      .split('\n\n')
                      .filter(Boolean)
                      .map((rec) => {
                        const [professor, review, subject, stars, course, school, date] = rec.split(' - ').map(s => s.split(': ')[1]);
                        return renderRecommendation({
                          prof: professor,
                          review: review,
                          subject: subject,
                          stars: stars,
                          course: course,
                          school: school,
                          date: date,
                        });
                      })}
                  </>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                )}
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
            sx={{ backgroundColor: "background.paper" }}
          />
          <Button
            variant="contained"
            size="large"
            sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "300px" },
          height: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          boxShadow: 3,
          backgroundColor: "background.paper",
          mt: { xs: 2, sm: 0 },
          ml: { xs: 0, sm: 2 },
        }}
      >
        <Typography>
          Enter a list of professor URLs, each on a separate line:
        </Typography>
        <TextField
          label="Rate My Professor URLs..."
          variant="outlined"
          fullWidth
          sx={{ backgroundColor: "background.paper" }}
          value={professorUrl}
          onChange={(e) => setProfessorUrl(e.target.value)}
          multiline
        />
        <Button
          variant="contained"
          size="large"
          sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
          onClick={processProfessorUrls}
        >
          {`Add Professor(s)`}
        </Button>
      </Stack>
    </Box>
  );
}
