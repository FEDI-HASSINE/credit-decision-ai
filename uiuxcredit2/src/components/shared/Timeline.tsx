import React from 'react';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';

type TimelineStep = {
  label: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp?: string;
  description?: string;
};

type TimelineProps = {
  steps: TimelineStep[];
};

export default function Timeline({ steps }: TimelineProps) {
  const getIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-white" />;
      case 'current':
        return <Clock className="w-5 h-5 text-white" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-white" />;
      default:
        return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  const getColors = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500',
          line: 'bg-green-500',
          text: 'text-green-700'
        };
      case 'current':
        return {
          bg: 'bg-blue-500',
          line: 'bg-gray-300',
          text: 'text-blue-700'
        };
      case 'failed':
        return {
          bg: 'bg-red-500',
          line: 'bg-gray-300',
          text: 'text-red-700'
        };
      default:
        return {
          bg: 'bg-gray-300',
          line: 'bg-gray-300',
          text: 'text-gray-500'
        };
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const colors = getColors(step.status);
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex gap-4">
            {/* Icon Column */}
            <div className="flex flex-col items-center">
              <div className={`${colors.bg} rounded-full p-2 flex items-center justify-center`}>
                {getIcon(step.status)}
              </div>
              {!isLast && (
                <div className={`w-0.5 h-16 ${colors.line} mt-2`} />
              )}
            </div>

            {/* Content Column */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`${colors.text}`}>{step.label}</h4>
                {step.timestamp && (
                  <span className="text-sm text-gray-500">{step.timestamp}</span>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-gray-600">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
