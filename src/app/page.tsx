import ReportForm from '@/components/report-form';
import { Car } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-3xl mb-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start space-x-3">
          <Car className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            AutoFault Reporter
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Easily capture and submit vehicle fault reports on-site.
        </p>
      </header>
      <main className="w-full max-w-3xl">
        <ReportForm />
      </main>
      <footer className="w-full max-w-3xl mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AutoFault Reporter. All rights reserved.</p>
      </footer>
    </div>
  );
}
