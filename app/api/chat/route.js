import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
const collegeSearch = `https://www.ratemyprofessors.com/search/schools?q=michigan%20state`
const getID = `https://www.ratemyprofessors.com/school/601`
const gather = `https://www.ratemyprofessors.com/search/professors/${schoolID}?q=${fname}%20${lname}`
const systemPrompt = `
You are a helpful and knowledgeable assistant for students seeking information on professors. 
Your job is to understand their queries and provide the top 3 professor recommendations based on their preferences, 
using the latest data available. Each response should include the professor's name, subject, rating, and a brief 
description or review to help the student make an informed decision. If the student asks about specific subjects, 
universities, or other criteria, tailor your responses accordingly.

Guidelines:

Understanding the Query: Accurately interpret the student's query to understand the specific requirements, such 
as subject, university, teaching style, or any other preferences.

Data Retrieval: Use Retrieval-Augmented Generation (RAG) to search for relevant professor data. Focus on matching 
the criteria specified in the query.

Ranking and Selection: Provide the top 3 professors who best match the student's query. The selection should be 
based on overall ratings, relevance to the subject, and quality of reviews.

Response Format: For each professor, include the following details:

Professor Name
Subject
Rating (out of 5 stars)
Brief Review/Description (highlight strengths, teaching style, or any notable feedback)
Professional and Clear Communication: Ensure that your responses are clear, concise, and free of bias. Provide 
accurate and up-to-date information, and avoid speculative or unverified content.

Examples:

"For a Computer Science course, I recommend Dr. Alice Johnson, who has a 4.8-star rating. Students appreciate her 
clear explanations and engaging lectures."
"If you're looking for a professor in Economics, Prof. Michael Harris might be a good fit. He has a 4.5-star 
rating, and students often mention his deep knowledge and practical insights."
`;

export async function POST(req) {
  const data = await req.json();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns2");  // Ensure you're querying the correct namespace
  const openai = new OpenAI();

  function extractProfessorName(query) {
    const regex = /professor\s+([a-zA-Z\s]+)/i;
    const match = query.match(regex);
    return match ? match[1].trim() : null;
  }

  function extractSubject(query) {
    const subjects = [
      "computer science", "mathematics", "physics", "chemistry", "history",
      "biology", "literature", "philosophy", "psychology", "economics",
      "sociology", "engineering", "political science", "anthropology", "art history",
      "environmental science", "music", "nursing", "business administration", "education", "law"
    ];
    for (let subject of subjects) {
      if (query.includes(subject.toLowerCase())) {
        return subject;
      }
    }
    return null;
  }

  function extractRating(query) {
    const regex = /rating\s+(above|greater than)\s+(\d)/i;
    const match = query.match(regex);
    return match ? parseInt(match[2], 10) : null;
  }

  // Extract query parameters
  const query = data[data.length - 1].content.toLowerCase();
  const professorName = extractProfessorName(query);
  const subject = extractSubject(query);
  const minRating = extractRating(query);

  // Create an embedding from the user's query
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
    encoding_format: 'float',
  });

  // Apply filters based on extracted query parameters
  const filters = {};
  if (professorName) filters["metadata.prof"] = professorName;
  if (subject) filters["metadata.subject"] = subject;
  if (minRating) filters["metadata.stars"] = { $gte: minRating };

  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
    filter: Object.keys(filters).length > 0 ? filters : undefined,
  });

  // Scoring and sorting results based on relevance
  function calculateScore(metadata) {
    let score = 0;
    if (metadata.stars >= 4) score += 10;  // Higher rating = higher score
    if (metadata.subject === subject) score += 20;  // Matching subject = higher score
    if (metadata.prof === professorName) score += 30;  // Matching professor = highest score
    return score;
  }

  const recommendations = results.matches.map(match => {
    let score = calculateScore(match.metadata);
    return { ...match.metadata, score };
  });

  recommendations.sort((a, b) => b.score - a.score);

  let resultString = '\n\nRecommended professors based on your preferences: ';
  recommendations.forEach((match) => {
    resultString += `
      Professor: ${match.prof}
      Review: ${match.review}
      Subject: ${match.subject}
      Stars: ${match.stars}
      Course: ${match.course}
      School: ${match.school}
      Date: ${match.date}
      \n\n`;
  });

  // Prepare and send the response
  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: 'user', content: lastMessageContent }
    ],
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
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    }
  });

  return new NextResponse(stream);
}
