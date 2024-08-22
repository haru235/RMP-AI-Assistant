import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';

const SentimentChart = ({ sentimentData }) => {
    
  useEffect(() => {
    const years = sentimentData.map(item => item.year);
    const sentimentScores = sentimentData.map(item => item.sentimentScore);

    const trace = {
      x: years,
      y: sentimentScores,
      mode: 'lines+markers',
      type: 'scatter',
      name: 'Sentiment Score',
      line: { shape: 'linear' },
      marker: { size: 8 }
    };

    const layout = {
      title: 'Professor Sentiment Over the Years',
      xaxis: { title: 'Year' },
      yaxis: { title: 'Sentiment Score' },
      showlegend: true,
      hovermode: 'closest'
    };

    const data = [trace];

    Plotly.newPlot('sentimentChart', data, layout);

    // Cleanup on component unmount
    return () => Plotly.purge('sentimentChart');
  }, [sentimentData]);

  return <div id="sentimentChart" style={{ width: '100%', height: '500px' }} />;
};

export default SentimentChart;
