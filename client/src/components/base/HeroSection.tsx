import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link  from "next/link";
function HeroSection() {
  return (
    <div className="w-full h-screen flex justify-center items-center flex-col">
      <div>
        <Image src="/dogpawcute.svg" width={400} height={400} alt="banner" />
      </div>
     <div className="text-center mt-4">
     <h1 className="text-6xl md:7xl lg:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
        PawPal
      </h1>
      <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center">Choose a better home for your pet</p>
     </div>
     <Link href="/login">    
     <Button className="mt-4">Get Started</Button>
     </Link>
    </div>
  );
}

export default HeroSection;
