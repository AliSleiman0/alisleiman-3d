import { Hero3D } from "@/components/3d/Hero3D";
import { ScrollManager } from "@/components/ScrollManager";
import { SmoothScroll } from "@/components/SmoothScroll";
import { HeroPinned } from "@/components/sections/HeroPinned";
import { About } from "@/components/sections/About";
import { Intro } from "@/components/sections/Intro";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <ScrollManager />
      <Hero3D />
      {/* No top nav: the page is one continuous scroll; the hero CTA is the
          only in-page link. `components/ui/Navbar.tsx` is kept but unmounted. */}
      <main>
        <HeroPinned />
        <About />
        <Intro />
        <ProjectsGrid />
        <Contact />
      </main>
    </>
  );
}
