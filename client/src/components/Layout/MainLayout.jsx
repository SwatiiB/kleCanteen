import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import useScrollRestoration from '../../hooks/useScrollRestoration';

const MainLayout = () => {
  // Use the scroll restoration hook to ensure proper scrolling behavior
  useScrollRestoration();

  return (
    <div className="flex flex-col min-h-screen bg-primary-200">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
