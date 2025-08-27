import React from "react";

export default function Hero() {
  return (
    <section className="relative isolate h-screen">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://media.giphy.com/media/26BRQTezZrKak4BeE/giphy.gif"
          alt="Looping festival montage"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
      </div>
      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-6">
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="font-heading text-xl md:text-2xl leading-tight">
              some things deserve to be seen
            </h1>
          </div>
        </div>
        <div className="mt-auto mb-4 flex items-center justify-center gap-3">
          <a href="#material" className="font-heading rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200">See the work</a>
          <a href="#contact" className="font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10">Get in touch</a>
        </div>
      </div>
    </section>
  );
}


