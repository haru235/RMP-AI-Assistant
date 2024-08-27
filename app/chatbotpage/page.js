'use client';

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProfCard from '../components/ProfCard'
import Markdown from 'markdown-to-jsx';

export default function ChatbotPage() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(null);
    const [reviews, setReviews ] = useState([]);
    const [profInfo, setProfInfo] = useState([]);
    const [showCard, setShowCard] = useState(false);
  
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

  const fetchProfessorData = async () => {
    const schoolName='michigan state'
    const firstName="dan"
    const lastName="thaler"
    setLoading(true); // Set loading state to true
    try {
      const response = await fetch("/api/profFind", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolName, firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched professor data: ", data);
    //   if (data.professorPageUrl) {
    //     setProfessorUrl(data.professorPageUrl);
    //     test(); // Call test() to scrape data from the professor page URL
    // }
    } catch (error) {
      console.error('Error fetching professor data:', error);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const testDepScrape = async () => {
    const url = professorUrl
    const response = await fetch("/api/departmentScraper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ urls: urls, max: 5 }),
      body: JSON.stringify({ url: url, max: 5 }),
    });
  }

  const processProfessorUrls = async () => {
    const urls = [professorUrl];
    professorUrl.split('\n').forEach((url, _) => {
      if (url.startsWith('https://www.ratemyprofessors.com/professor/')) {
        urls.push(url);
      } else {
        console.log('Invalid Url: ', url);
      }
    });
    setProfessorUrl('');
    try {
      const response = await fetch("/api/scrape", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: urls, max: 5 }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Response Data:", responseData);
      setReviews(responseData.reviews)
      setProfInfo(responseData.profInfo)
      setChartData(responseData.sentimentData)
  } catch (error) {
      console.error("Error fetching from /api/scrape:", error);
  }
  };

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
  
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + result },
          ];
        });
      }
    } catch (error) {
      console.error("Error while sending message:", error);
    }
  };
  return (
    <Box sx={{display: "flex",flexDirection:"column"}}>
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
          Enter this https://www.ratemyprofessors.com/search/professors/250?q=*
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
          onClick={testDepScrape}
        >
          {`Add Professor(s)`}
        </Button>
      </Stack>
      
      </Box>
      <Button onClick={() => fetchProfessorData()}>press here</Button>
      {showCard ? (
        <div>
        <Button onClick={() => setShowCard(false)}>
        Hide Professor Card
      </Button>
        <ProfCard profInfo={profInfo} reviews={reviews} chartData={chartData} />
        </div>
      ) : (
        <Button onClick={() => setShowCard(true)}>
          Show Professor Card for More Info
        </Button>
      )}

    </Box>
  );
}
