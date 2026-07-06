import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
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
