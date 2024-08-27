import React from 'react';

const PriceCard = ({ plan, price, features, buttonText, onButtonClick }) => {
  return (
    <div className="border flex flex-col justify-between items-center rounded-lg p-6 text-center shadow-lg">
      <div className='flex flex-col gap-10 items-center justify-center'>
        <h2 className="text-lg font-semibold mb-2">{plan}</h2>
        <p className="text-4xl font-bold mb-2">${price} <span className="text-base font-medium">/ month</span></p>
        <ul className="text-left mb-6">
          {features.map((feature, index) => (
            <li key={index} className="mb-2 flex items-start">
              <span className="mr-2 text-green-500">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onButtonClick}
        className={`w-full py-2 rounded ${plan === 'Free' ? 'bg-gray-200 text-gray-800' : 'bg-black text-white hover:bg-gray-800'} transition duration-300`}>
        {buttonText}
      </button>
    </div>
  );
};

export default PriceCard;
