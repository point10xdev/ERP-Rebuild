import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { ROUTES } from '../../../app/routes';
import { ClipboardCheck, BookOpen } from 'lucide-react';

type ActionColor = 'green' | 'indigo' | 'purple';

interface ActionItem {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  color: ActionColor;
}

export const ScholarshipPage = () => {
  const actions: ActionItem[] = [
    { 
      title: 'Approve Scholarship', 
      description: 'Review student scholarship applications, verify eligibility, and approve or reject scholarship requests. ',
      link: ROUTES.APPROVE_SCHOLARSHIP,
      icon: <ClipboardCheck className="w-5 h-5 text-green-500" />,
      color: 'green'
    },
    { 
      title: 'Scholarship Management', 
      description: 'Oversee the full lifecycle of scholarship programs including student allocation, faculty assignment, and fund tracking.',
      link: ROUTES.SCHOLARSHIP_MANAGEMENT,
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      color: 'indigo'
    }
  ];

  // Function to get color classes based on the action's color
  const getColorClasses = (color: ActionColor) => {
    const colors = {
      green: {
        bg: 'bg-green-200 dark:bg-green-900/30 hover:bg-green-300 dark:hover:bg-green-900/50',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-100 dark:border-green-800'
      },
      indigo: {
        bg: 'bg-indigo-300 dark:bg-indigo-700/30 hover:bg-indigo-300 dark:hover:bg-indigo-700/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-100 dark:border-indigo-800'
      },
      purple: {
        bg: 'bg-purple-200 dark:bg-purple-800/30 hover:bg-purple-300 dark:hover:bg-purple-700/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-100 dark:border-purple-800'
      }
    };
    return colors[color];
  };

  return (
    <div className="p-8 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Scholarship Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => {
          const colorClasses = getColorClasses(action.color);
          
          return (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses.bg} mr-3`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{action.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{action.description}</p>
                <div className={`mt-auto pt-3 border-t ${colorClasses.border}`}>
                  <div className={`${colorClasses.bg} ${colorClasses.text} py-2 px-4 rounded-lg flex items-center justify-center`}>
                    <span>Manage</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

