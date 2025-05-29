"use client";

import ReportForm from '@/components/report-form';
import { useRouter } from 'next/navigation';

const ReportPage: React.FC = () => {
  const router = useRouter();
  return (
    // You might want to pass the router instance or a navigation function to ReportForm if it needs to trigger navigation itself
    <div className="container mx-auto px-4 py-8">
      <ReportForm onReportSubmitSuccess={() => router.push('/')} />
    </div>
  );
};

export default ReportPage;