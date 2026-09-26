import { Hero } from '@/components/home/Hero';
import { Recognition } from '@/components/home/Recognition';
import { SelectedWork } from '@/components/home/SelectedWork';
import { HowIWork } from '@/components/home/HowIWork';
import { Capabilities } from '@/components/home/Capabilities';
import { About } from '@/components/home/About';
import { AskSection } from '@/components/home/AskSection';
import { Contact } from '@/components/home/Contact';
import { SpecimenRail } from '@/components/specimen/Specimen';

/**
 * One long page, eight numbered sections.
 *
 * Sections 01 to 03 keep their content in the left seven columns on desktop,
 * because the specimen occupies the right of the screen and morphs as those
 * three sections pass. From 04 onward the page reclaims the full measure.
 */
export default function Home() {
  return (
    <>
      <SpecimenRail />
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
