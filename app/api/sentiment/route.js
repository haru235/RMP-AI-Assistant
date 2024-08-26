import OpenAI from "openai";

export async function POST(req) {
  console.log("in sentiment");
  const openai = new OpenAI();
  
  try {
    const data = await req.json();
    const reviewsUnsliced = data.reviews;

    // Limit to the first 10 reviews
    const reviews = reviewsUnsliced.slice(0, 10);

    // Combine all reviews into a single prompt
    const prompt = reviews.map((item, index) => 
      `Review ${index + 1}: "${item.content}"`).join("\n") +
      "\nAnalyze the sentiment of each review by a student talking about a teacher's personality and teaching style and provide a float sentiment score rounded to the nearest tenth between -1 (negative) and 1 (positive). Return only the sentiment scores as a JSON array.";

    // Request sentiment analysis for all reviews in one call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // replace with your desired model
      messages: [
        { role: "system", content: "You are a helpful assistant that provides sentiment analysis." },
        { role: "user", content: prompt }
      ],
    });

    // Log the response content for debugging
    const rawResponse = completion.choices[0].message.content;
    console.log("Raw API response:", rawResponse);

    const jsonResponse = rawResponse.replace(/```json|```/g, '').trim();

    const sentimentScores = JSON.parse(jsonResponse);

    // Ensure the number of sentiment scores matches the number of reviews
    if (sentimentScores.length !== reviews.length) {
      throw new Error("Mismatch between number of reviews and sentiment scores.");
    }

    // Map the sentiment scores to the original reviews
    const analyzedData = reviews.map((item, index) => ({
      date: item.date,
      sentiment_score: sentimentScores[index]
    }));

    // Sort the analyzedData by date
    analyzedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log("analyzed Data", analyzedData);

    // Return JSON response
    return new Response(JSON.stringify(analyzedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
