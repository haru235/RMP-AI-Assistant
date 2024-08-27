import React from 'react';
import FAQItem from './FAQItem';

const FAQ = () => {
  const faqData = [
    {
      question: 'What is the daily lookup limit for each plan?',
      answer: 'The Free plan allows up to 10 lookups per day, the Basic plan allows up to 50 lookups per day, and the Premium plan offers unlimited lookups.',
    },
    {
      question: 'Which websites are included in the search scope?',
      answer: 'The search scope includes popular professor review websites such as Rate My Professors, Course Hero, and others depending on your subscription plan.',
    },
    {
      question: 'How often are the reviews updated?',
      answer: 'The reviews are updated daily to ensure you get the most recent and relevant feedback about professors.',
    },
    {
      question: 'Can I receive notifications for new reviews?',
      answer: 'Yes, with the Basic and Premium plans, you can receive notifications for new reviews or significant changes in professor ratings.',
    },
    {
      question: 'What kind of customer support is available?',
      answer: 'We offer email support for all plans, and Premium users also get access to live chat with our support team 24/7.',
    },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-6">FAQ</h2>
        {faqData.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
