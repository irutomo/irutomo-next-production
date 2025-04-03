import Image from 'next/image';

export function ImageGallery() {
  const images = [
    {
      src: "/images/landing-page-image1.jpg",
      alt: "韓国料理の予約サービス"
    },
    {
      src: "/images/landing-page-image2.jpg", 
      alt: "日本の居酒屋料理"
    },
    {
      src: "/images/landing-page-image3.jpg",
      alt: "焼肉"
    },
    {
      src: "/images/landing-page-image4.jpg",
      alt: "料理人"
    }
  ];

  return (
    <section className="bg-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">料理の写真</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="aspect-square relative rounded-lg overflow-hidden shadow-md">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority={index < 2}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 