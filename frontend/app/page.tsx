import { GalleryFilterProvider } from "@/components/gallery/FilterContext";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Portfolio from "@/components/sections/Portfolio";
import Process from "@/components/sections/Process";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Marquee from "@/components/ui/Marquee";

/**
 * The landing page — one scroll, one conversion path.
 *
 * Services and Portfolio share a filter provider so that tapping a category
 * tile scrolls to the gallery with that category already applied.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />

      <GalleryFilterProvider>
        <Services />
        <Portfolio />
      </GalleryFilterProvider>

      <Process />
      <About />
      <Testimonials />
      <Contact />
    </>
  );
}
