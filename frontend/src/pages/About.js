import React from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, Target, Download, Shield, Code } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-400" />,
      title: "Reference-Based Mastering",
      description: "Upload any reference track and our AI will match your music's RMS, frequency response, peak amplitude, and stereo width to create a professional master."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "AI-Powered Processing",
      description: "Built on the proven Matchering engine with 2.3k+ GitHub stars and ranked #3 in professional mastering comparisons."
    },
    {
      icon: <Download className="h-8 w-8 text-green-400" />,
      title: "Multiple Output Formats",
      description: "Get your mastered tracks in 16-bit and 24-bit WAV formats for maximum compatibility with any DAW or streaming platform."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-400" />,
      title: "High-Quality Limiting",
      description: "Built-in Hyrax brickwall limiter ensures your tracks are properly limited without distortion or artifacts."
    },
    {
      icon: <Code className="h-8 w-8 text-red-400" />,
      title: "Open Source Technology",
      description: "Built on open-source Matchering library with GPL-3.0 license, ensuring transparency and community-driven development."
    },
    {
      icon: <Music className="h-8 w-8 text-indigo-400" />,
      title: "Professional Results",
      description: "Used by music producers, audio engineers, and integrated into professional tools like UVR5 Desktop App."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-white mb-6">About MatchMaster</h1>
        <p className="text-xl text-gray-200 max-w-4xl mx-auto">
          MatchMaster is a professional audio mastering platform that uses advanced AI technology 
          to match your tracks to any reference song. Built on the proven Matchering engine, 
          it delivers professional-quality results instantly.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-300">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div 
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Upload Your Track</h3>
            <p className="text-gray-300">
              Upload the track you want to master (target) and a reference track that has the sound you want to achieve.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI Processing</h3>
            <p className="text-gray-300">
              Our AI analyzes both tracks and applies professional mastering techniques to match the reference's characteristics.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Download Results</h3>
            <p className="text-gray-300">
              Get your professionally mastered track in multiple formats, ready for distribution or further production.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div 
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Backend</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>FastAPI</strong> - Modern Python web framework</li>
              <li>• <strong>Matchering</strong> - Core audio processing engine</li>
              <li>• <strong>Redis</strong> - Job queue and caching</li>
              <li>• <strong>Docker</strong> - Containerized deployment</li>
              <li>• <strong>libsndfile</strong> - Audio file I/O</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Frontend</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>React</strong> - Modern UI framework</li>
              <li>• <strong>Tailwind CSS</strong> - Utility-first styling</li>
              <li>• <strong>Framer Motion</strong> - Smooth animations</li>
              <li>• <strong>React Dropzone</strong> - File upload interface</li>
              <li>• <strong>Axios</strong> - HTTP client</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Credits */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Credits</h2>
        <p className="text-gray-300 mb-4">
          MatchMaster is built on top of the excellent <a href="https://github.com/sergree/matchering" className="text-blue-400 hover:text-blue-300 underline">Matchering</a> library by sergree.
        </p>
        <p className="text-gray-400 text-sm">
          Special thanks to the open-source community and all contributors who made this project possible.
        </p>
      </motion.div>
    </div>
  );
};

export default About;

