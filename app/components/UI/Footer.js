import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <p className="text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0">
            <a href="/privacy-policy" className="text-sm text-gray-400 hover:text-white ml-4">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-sm text-gray-400 hover:text-white ml-4">
              Terms of Service
            </a>
            <a href="/contact" className="text-sm text-gray-400 hover:text-white ml-4">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
