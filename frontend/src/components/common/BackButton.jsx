import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, label, className = '' }) => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => to ? navigate(to) : navigate(-1)}
      className={`flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group mb-6 ${className}`}
    >
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium text-sm">{label || 'Back'}</span>
    </button>
  );
};

export default BackButton;
