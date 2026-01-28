import React from 'react';

type Status = 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_required';

type StatusBadgeProps = {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending'
    },
    under_review: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Under Review'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rejected'
    },
    more_info_required: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'More Info Required'
    }
  };

  const config = configs[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}
