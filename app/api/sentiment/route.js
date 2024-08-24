// import fs from 'fs';
// import path from 'path';

// export async function GET(req, res) {
//   const filePath = path.join(process.cwd(), 'sentiment_results.json');
//   const fileContents = fs.readFileSync(filePath, 'utf8');
//   const data = JSON.parse(fileContents);

//   return new Response(JSON.stringify(data), {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// }
import { SentimentIntensityAnalyzer } from 'vader-sentiment';

// Initialize VADER SentimentIntensityAnalyzer
const analyzer = SentimentIntensityAnalyzer;
console.log("analyzer ", analyzer)

// Example Data
// const data = [
//   {
//     date: '2024-08-01',
//     review: "The professor is amazing and really helps students understand the material."
//     // review: "the worst fucking professor ever I hate him"
//   },
//   {
//     date: '2024-08-02',
//     review: "The lectures are boring, and I struggled with the assignments."
//   },
//   {
//     date: '2024-08-03',
//     review: "Great professor, but the exams are too difficult."
//   }
// ];

export async function POST(req) {
  console.log("in sentiment")
  try {
    const data = await req.json();
    console.log("here is data ", data.reviews)
    // Analyze Sentiments
    const analyzedData = data.reviews.map(item => {
      const result = analyzer.polarity_scores(item.content);
      console.log("here is result", result)
      return {
        date: item.date,
        sentiment_score: result.compound // sentiment score (positive or negative)
      };
    });

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