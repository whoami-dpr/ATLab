import React from 'react';
import Image from 'next/image';

const galleryImages = [
  { src: '/gallery-images/f1.jpg', alt: 'Formula 1 Car' },
  { src: '/gallery-images/indycar.jpg', alt: 'IndyCar' },
  { src: '/gallery-images/motogp.jpg', alt: 'MotoGP bike' },
  { src: '/gallery-images/nascar.jpg', alt: 'NASCAR car' },
  { src: '/gallery-images/tc.jpg', alt: 'Turismo Carretera car' },
  { src: '/gallery-images/wrc.jpg', alt: 'WRC rally car' },
];

const HeroBanner = () => {
  return (
    <div className="relative w-full h-20 md:h-24 lg:h-28 overflow-hidden mb-4">
      {/* Image Grid */}
      <div className="absolute inset-0 grid grid-cols-6 h-full">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="relative w-full h-full"
            style={{ borderRight: index < galleryImages.length - 1 ? '1px solid rgba(0,0,0,0.25)' : 'none' }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dark blue overlay to match the sample */}
      <div className="absolute inset-0 bg-[#0b2340] opacity-60 mix-blend-multiply" />

      {/* Text Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold italic tracking-[0.18em] uppercase drop-shadow-lg">
          Calendario ATLab
        </h1>
        <p className="text-xs md:text-sm mt-1 opacity-90">Calendario completo del motorsport</p>
      </div>
    </div>
  );
};

export default HeroBanner;
