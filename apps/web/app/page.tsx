import { Hero } from '@/components/home/Hero';
import { Recognition } from '@/components/home/Recognition';
import { SelectedWork } from '@/components/home/SelectedWork';
import { HowIWork } from '@/components/home/HowIWork';
import { Capabilities } from '@/components/home/Capabilities';
import { About } from '@/components/home/About';
import { AskSection } from '@/components/home/AskSection';
import { Contact } from '@/components/home/Contact';

/**
 * One long page, eight numbered sections.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Recognition />
      <SelectedWork />
      <HowIWork />
      <Capabilities />
      <About />
      <AskSection />
      <Contact />
    </>
  );
}
