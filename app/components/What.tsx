import React from "react";
import SectionHeading from "./SectionHeading";
import WorldMapAnimation from "./WorldMapAnimation";

export default function What() {
  return (
    <section id="what" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <SectionHeading
        eyebrow="Hidden stories"
        title="The world is full of stories that will blow your mind."
        kicker="We travel to places that don’t show up on maps or Instagram feeds. We're after the kinds of moments you can’t Google, the ones whispered about by locals or hidden in plain sight, full of noise, chaos, beauty, and sometimes danger."
      />
    <WorldMapAnimation />
    <SectionHeading
        // eyebrow="What we do"
        title="These aren't polished documentaries."
        kicker="No hotels. No crew. One backpack. We follow the trail of stories, sleeping wherever we’re welcomed, someone’s couch, a tent, the back of a truck. Our trips are built on word of mouth. Locals point us to someone who knows someone. That’s how we find the things no one talks about."
      />
    </section>
  );
}


