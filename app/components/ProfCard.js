'use client';

import { AreaChart, Color } from '@tremor/react';


export default function ProfCard({ profInfo, reviews, chartData}) {
      console.log("PROF INFO", profInfo )
      console.log("REVIEWS ", reviews)
      console.log("CHART ", chartData)
//   chartData = [
//   { date: 'Mar 10th, 2024', sentiment_score: -1 },
//   { date: 'Mar 10th, 2024', sentiment_score: -1 },
//   { date: 'Feb 25th, 2024', sentiment_score: -1 },
//   { date: 'May 25th, 2023', sentiment_score: -0.7 },
//   { date: 'Mar 30th, 2023', sentiment_score: -0.9 }
// ];
  const dataFormatter = (number) => number.toString();
  console.log(chartData)

  const formatData = (data) => {
    return chartData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      sentiment_score: item.sentiment_score.toFixed(2)
    }));
  };
  
  const formattedData = formatData(chartData);
  console.log("FORMATTED33", formattedData);

  const uniqueClasses = [...new Set(reviews.map(review => review.classTaught))];

  
  return (
    <div className="w-3/4 mx-auto p-6 shadow-lg bg-white rounded-lg mb-6">
      {/* Professor's Name */}
      <div className="flextext-xl font-semibold mb-4">
        <p>{profInfo.name}</p>
        <p>Stars: {profInfo.stars}</p>
        <p>Take Again: {profInfo.takeAgain}</p>
      </div>
      <div>
        Classes taught: {uniqueClasses.join(', ')}
      </div>

      <h3 className="flextext-xl font-semibold mb-4">Professor Sentiment Over Time</h3>

      {/* Graph */}
      <div className="mt-6">
      <AreaChart
      className="h-80"
      showGradient={false}
      data={chartData}
      index="date"
      minValue={-1}
      showLegend={false}
      maxValue={1}
      categories={['sentiment_score']}
      colors={['#2757a3']}
      valueFormatter={dataFormatter}
      yAxisWidth={60}
    />
      </div>
    </div>
  );
};

