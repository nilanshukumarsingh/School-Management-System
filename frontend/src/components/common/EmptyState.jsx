import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There is currently no data to display for this section.',
  actionLabel,
  onAction,
  illustration,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 my-4">
      {illustration ? (
        <img src={illustration} alt="Empty illustration" className="w-36 h-36 mb-4 object-contain" />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
