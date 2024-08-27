import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded px-3 border-2 border-gray-300 mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center focus:outline-none">
        <span className={`font-semibold ${isOpen ? 'text-black' : 'text-gray-800'}`}>
          {question}
        </span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>
      {isOpen && <p className="text-gray-600 mt-2 mb-4">{answer}</p>}
    </div>
  );
};

export default FAQItem;
