import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import About from '../About';

export default function CustomerAbout() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page">
        <About />
      </main>
      <SiteFooter />
    </div>
  );
}