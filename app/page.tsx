import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import Footer from './components/Footer';
import StreakBar from './components/StreakBar';

export default function Home() {
  return (
    <>
      <Nav />
      <div className="fixed top-20 right-6 md:right-12 lg:right-20 z-40">
        <StreakBar />
      </div>
      <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Hero />
        <Work />
        {/* TODO: About section in Phase 2 or later */}
        <section id="about" />
      </main>
      <Footer />
    </>
  );
}
