import React, { useState, useEffect } from 'react';
import { Music, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = ({ user }) => {
  const [jobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch user's jobs from the API
    // For now, we'll show a placeholder
    setLoading(false);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-white mb-8">Your Mastering Jobs</h1>
        
        {jobs.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center border border-white/20">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs yet</h3>
            <p className="text-gray-300 mb-6">
              Start mastering your tracks by uploading them on the home page.
            </p>
            <a
              href="/"
              className="btn-primary text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Start Mastering
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {job.target_name} → {job.reference_name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Created {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    
                    {job.status === 'completed' && (
                      <div className="flex space-x-2">
                        {job.output_files?.map((file, index) => (
                          <button
                            key={index}
                            className="btn-secondary text-white px-3 py-2 rounded-lg font-medium text-sm"
                          >
                            <Download className="h-4 w-4 inline mr-1" />
                            {file.includes('pcm16') ? '16-bit' : '24-bit'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {job.status === 'processing' && (
                  <div className="mt-4">
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{job.message}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
