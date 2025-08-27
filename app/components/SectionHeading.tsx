import React from "react";

type SectionHeadingProps = {
  kicker?: string;
  title: string;
  eyebrow?: string;
};

export default function SectionHeading({ kicker, title, eyebrow }: SectionHeadingProps) {
  return (
    <header className="mb-6">
      {eyebrow ? (
        <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">{eyebrow}</div>
      ) : null}
      <h2 className="font-heading text-2xl md:text-4xl font-semibold leading-tight text-zinc-100">
        {title}
      </h2>
      {kicker ? <p className="mt-2 text-zinc-300 max-w-2xl">{kicker}</p> : null}
    </header>
  );
}


