import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import LearningPath from "@/components/home/LearningPath";
import Games from "@/components/home/Games";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Features />
        <LearningPath />
        <Games />
        <CTA />
      </main>
    </>
  );
}