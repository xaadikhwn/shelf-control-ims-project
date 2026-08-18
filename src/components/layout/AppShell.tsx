import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import ToastContainer from '../ui/ToastContainer';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Loading module...</p>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <div className="min-h-screen bg-navy-950 text-text-primary font-sans">
      <Sidebar />
      <ToastContainer />

      <div className="lg:ml-[220px] flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 p-4 lg:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  );
}
