import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

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
rating, and students often mention his deep knowledge and practical insights.
`;
export async function POST(req) {
  const data = await req.json();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1")
  const openai = new OpenAI()

  const text = data[data.length - 1].content
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: 'float',
  })

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  })

  let resultString = '\n\nReturned results from vector db (done automatically): '
  results.matches.forEach((match) => {
    resultString += `\n
    Professor: ${match.id}
    Review: ${match.metadata.review}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n
    `
  })

  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

  const completion = await openai.chat.completions.create({
    messages: [
        {role: 'system', content: systemPrompt},
        ...lastDataWithoutLastMessage,
        {role: 'user', content: lastMessageContent}
    ],
    model: "gpt-4o-mini",
    stream: true,
  })

  const stream =  new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder()
        try {
            for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content
                if (content) {
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                }
            }
        } catch(err) {
            controller.error(err)
        } finally {
            controller.close();
        }
    }
  })

  return new NextResponse(stream)
}
