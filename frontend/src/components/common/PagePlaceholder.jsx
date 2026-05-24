import React from 'react';
import BackButton from './BackButton';

const PagePlaceholder = ({ title, description, icon: Icon, showBack = true, backTo, backLabel }) => {
  return (
    <div className="h-full flex flex-col">
      {showBack && <BackButton to={backTo} label={backLabel} />}
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
          {Icon && <Icon size={40} className="text-indigo-600" />}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 max-w-md text-lg">{description}</p>
      </div>
    </div>
  );
};

export default PagePlaceholder;
