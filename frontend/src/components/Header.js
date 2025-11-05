import React from 'react';
import { Link } from 'react-router-dom';
import { Music, User, LogOut } from 'lucide-react';

const Header = ({ user, setUser }) => {
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors">
            <Music className="h-8 w-8" />
            <span className="text-2xl font-bold">MatchMaster</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-white hover:text-gray-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-white hover:text-gray-200 transition-colors font-medium"
            >
              About
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-gray-200 transition-colors font-medium">
                  Sign In
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

