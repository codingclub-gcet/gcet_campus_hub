import React, { useRef } from 'react';
import SectionHeader from './SectionHeader';

// Data for developers based on the provided image
const DEVELOPERS = [
  {
    id: 1,
    name: 'K. Parameshwara Rao',
    title: 'Developed the Frontend and Backend of the website',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/evnty-124fb.firebasestorage.app/o/WhatsApp%20Image%202025-06-06%20at%2011.44.04%20(1).jpeg?alt=media&token=a9469518-ac2f-49e6-b5b0-c09e5e713f12',
  },
  {
    id: 2,
    name: 'Pavan Bejawada',
    title: 'Designed and Developed the Frontend of the website',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/evnty-124fb.firebasestorage.app/o/pavan_image.jpeg?alt=media&token=384136d9-6282-4797-88c9-2a113b86b2ac',
  },
];

const DeveloperCard: React.FC<{ developer: typeof DEVELOPERS[0], index: number }> = ({ developer, index }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const rotateX = (y / height - 0.5) * -20;
        const rotateY = (x / width - 0.5) * 20;
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };
    
    return (
    <div 
        className="perspective-container group animate-card-enter"
        style={{ animationDelay: `${index * 150}ms` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
    >
        <div ref={cardRef} className="tilt-card bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-lg text-center transition-transform duration-300 ease-out">
            <img
                className="w-40 h-40 object-cover rounded-full mb-4 shadow-lg mx-auto border-4 border-slate-800 group-hover:border-indigo-500 transition-colors"
                src={developer.imageUrl}
                alt={developer.name}
                style={{ transform: 'translateZ(40px)' }}
            />
            <h3 className="text-xl font-extrabold text-white tracking-tight" style={{ transform: 'translateZ(30px)' }}>{developer.name}</h3>
            <p className="text-base text-indigo-400 font-semibold" style={{ transform: 'translateZ(20px)' }}>{developer.title}</p>
        </div>
    </div>
  );
};

const DeveloperSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Meet the Developers"
          subtitle="The minds behind the code, crafting a seamless campus experience for you."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {DEVELOPERS.map((dev, index) => (
            <DeveloperCard key={dev.id} developer={dev} index={index}/>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;