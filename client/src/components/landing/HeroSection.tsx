import React from 'react';
import { motion } from 'framer-motion';
import MapPlaceholder from './MapPlaceholder';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24" id="hero">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
        {/* Text content */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Your Campus. Smarter. Always One Step Ahead.
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered navigation that knows where your next class is, detects classroom changes in real time, and guides you there before you're late.
          </p>
          <div className="flex space-x-4">
            <a
              href="/app"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Open Smart Navigation
            </a>
            <a
              href="#ai-explore"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Explore AI
            </a>
          </div>
        </div>
        {/* Map visualization */}
        <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center md:justify-end">
          <MapPlaceholder />
        </div>
      </div>
    </section>
  );
}
