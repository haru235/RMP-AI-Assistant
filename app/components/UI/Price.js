import React, { useState } from 'react';
import PriceCard from './PriceCard';

const Price = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      plan: 'Free',
      price: '0',
      features: [
        'Access up to 5 professor reviews from the most popular sources',
        'Searches only the top 3 review websites',
        'Access to the user forum for basic inquiries and troubleshooting',
      ],
      buttonText: 'Create a free account',
    },
    {
      plan: 'Basic',
      price: billingPeriod === 'monthly' ? '5' : '50',
      features: [
        'Access up to 20 professor reviews from a broader range of sources',
        'Searches across the top 10 review websites',
        'Receive notifications about new reviews or significant changes in professor ratings',
        'Access to ProfAI support experts',
      ],
      buttonText: 'Buy now',
    },
    {
      plan: 'Premium',
      price: billingPeriod === 'monthly' ? '10' : '100',
      features: [
        'Access unlimited professor reviews from a wide array of sources',
        'Searches across all available review websites, including academic and social media platforms',
        'Apply detailed filters, trends, and insights to the collected reviews',
        '24/7 access to a dedicated support team with live chat',
      ],
      buttonText: 'Buy now',
    },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="flex justify-center mb-6">
        <button 
          onClick={() => setBillingPeriod('monthly')}
          className={`px-4 py-2 rounded-l-lg ${billingPeriod === 'monthly' ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'} transition duration-300`}>
          Monthly
        </button>
        <button 
          onClick={() => setBillingPeriod('yearly')}
          className={`px-4 py-2 rounded-r-lg ${billingPeriod === 'yearly' ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'} transition duration-300`}>
          Yearly
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <PriceCard 
            key={index} 
            plan={plan.plan} 
            price={plan.price} 
            features={plan.features} 
            buttonText={plan.buttonText} 
            onButtonClick={() => alert(`Selected ${plan.plan} plan`)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Price;
