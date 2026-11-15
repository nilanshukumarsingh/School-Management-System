import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center selection:bg-indigo-500 selection:text-white">
      <div className="mb-6">
        <Logo size="lg" showText={true} textVariant="dark" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tight font-mono">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Resource Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The academic record, dashboard, or endpoint you requested is not available.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon={ArrowLeft} className="font-bold">
          Return to Platform
        </Button>
      </Link>
    </div>
  );
};
