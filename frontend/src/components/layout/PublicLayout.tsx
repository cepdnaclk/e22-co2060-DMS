import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

export default function PublicLayout() {
  return (
    <div className="page-bg">
      <ScrollToTop />
      <Navbar />
      <main className="pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

