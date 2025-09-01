import React from "react";

type SectionHeadingProps = {
  kicker?: string | React.ReactNode;
  title: string;
  eyebrow?: string;
  className?: string;
};

export default function SectionHeading({ kicker, title, eyebrow, className = "mb-6" }: SectionHeadingProps) {
  return (
    <header className={`text-center ${className}`}>
      {eyebrow ? (
        <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">{eyebrow}</div>
      ) : null}
      <h2 className="font-heading text-2xl md:text-4xl font-semibold leading-tight text-zinc-100">
        {title}
      </h2>
      {kicker ? <p className="mt-4 text-zinc-300 max-w-3xl mx-auto">{kicker}</p> : null}
    </header>
  );
}


