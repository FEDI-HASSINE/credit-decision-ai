import React from 'react';
import { Building2, LogOut, User } from 'lucide-react';

type HeaderProps = {
  user: {
    name: string;
    email: string;
    role: 'client' | 'banker';
  };
  onLogout: () => void;
};

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-900">Credit Decision AI</h1>
              <p className="text-xs text-gray-500">
                {user.role === 'client' ? 'Client Portal' : 'Banker Dashboard'}
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
