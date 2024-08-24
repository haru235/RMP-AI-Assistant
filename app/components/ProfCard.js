'use client';

import { AreaChart } from '@tremor/react';

export default function ProfCard({ professorName, chartData}) {
  // chartdata = [
  //   {
  //     date: 'Jan 22',
  //     SolarPanels: 2890,
  //     Inverters: 2338,
  //   },
  //   {
  //     date: 'Feb 22',
  //     SolarPanels: 2756,
  //     Inverters: 2103,
  //   },
  //   {
  //     date: 'Mar 22',
  //     SolarPanels: 3322,
  //     Inverters: 2194,
  //   },
  //   {
  //     date: 'Apr 22',
  //     SolarPanels: 3470,
  //     Inverters: 2108,
  //   },
  //   {
  //     date: 'May 22',
  //     SolarPanels: 3475,
  //     Inverters: 1812,
  //   },
  //   {
  //     date: 'Jun 22',
  //     SolarPanels: 3129,
  //     Inverters: 1726,
  //   },
  //   {
  //     date: 'Jul 22',
  //     SolarPanels: 3490,
  //     Inverters: 1982,
  //   },
  //   {
  //     date: 'Aug 22',
  //     SolarPanels: 2903,
  //     Inverters: 2012,
  //   },
  //   {
  //     date: 'Sep 22',
  //     SolarPanels: 2643,
  //     Inverters: 2342,
  //   },
  //   {
  //     date: 'Oct 22',
  //     SolarPanels: 2837,
  //     Inverters: 2473,
  //   },
  //   {
  //     date: 'Nov 22',
  //     SolarPanels: 2954,
  //     Inverters: 3848,
  //   },
  //   {
  //     date: 'Dec 22',
  //     SolarPanels: 3239,
  //     Inverters: 3736,
  //   },
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
  console.log("FORMATTED", formattedData);

  return (
    <div className="w-3/4 mx-auto p-6 shadow-lg bg-white rounded-lg mb-6">
      {/* Professor's Name */}
      <div className="text-xl font-semibold mb-4">
        <p>{professorName}</p>
      </div>

      {/* Graph */}
      <div className="mt-6">
      <AreaChart
      className="h-80"
      data={formattedData}
      index="date"
      categories={['sentiment_score']}
      colors={['indigo']}
      valueFormatter={dataFormatter}
      yAxisWidth={60}
    />
      </div>
    </div>
  );
};

