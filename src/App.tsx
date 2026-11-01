import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Directions } from '@/components/sections/Directions';
import { Services } from '@/components/sections/Services';
import { Process } from '@/components/sections/Process';
import { Logistics } from '@/components/sections/Logistics';
import { Advantages } from '@/components/sections/Advantages';
import { RequestSection } from '@/components/sections/RequestSection';
import { Contacts } from '@/components/sections/Contacts';
import { AIChatWidget } from '@/modules/ai-chat/components/AIChatWidget';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:bg-copper-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Перейти к содержанию
      </a>

      <Header />

      <main className="flex-1">
        <Hero />
        <About />
        <Directions />
        <Services />
        <Process />
        <Logistics />
        <Advantages />
        <RequestSection />
        <Contacts />
      </main>

      <Footer />

      <AIChatWidget />
    </div>
  );
}
