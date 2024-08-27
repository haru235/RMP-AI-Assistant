import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    support: '',
    category: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //form submission logic
    console.log('Form submitted:', formData);
  };

  return (
    <div className="w-96 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="Enter Your name" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile No.</label>
          <input 
            type="text" 
            id="mobile" 
            name="mobile" 
            value={formData.mobile} 
            onChange={handleChange}
            placeholder="Enter Your mobile number" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            placeholder="Enter Your email address" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="support" className="block text-sm font-medium text-gray-700">What support you need regarding*</label>
          <select 
            id="support" 
            name="support" 
            value={formData.support} 
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Select support type</option>
            <option value="technical">Technical Support</option>
            <option value="billing">Billing Support</option>
            <option value="general">General Inquiry</option>
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Support Category*</label>
          <select 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Select category</option>
            <option value="account">Account Issues</option>
            <option value="payment">Payment Issues</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
