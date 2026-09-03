import { Navbar } from "@/components/ui/Navbar";
import { Hero3D } from "@/components/3d/Hero3D";
import { ScrollManager } from "@/components/ScrollManager";
import { HeroPinned } from "@/components/sections/HeroPinned";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <ScrollManager />
      <Hero3D />
      <Navbar />
      <main>
        <HeroPinned />
        <About />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
