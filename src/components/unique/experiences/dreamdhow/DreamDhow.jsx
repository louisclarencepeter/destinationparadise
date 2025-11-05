import { useMemo } from "react";
import useScrollToTop from "../../../../utils/scrollToTop";
import HeroSection from "./sections/HeroSection";
import ImagePreviewSection from "./sections/ImagePreviewSection";
import ContentSection from "./sections/ContentSection";
import VideoSection from "./sections/VideoSection";
import WhyBookUsSection from "./sections/WhyBookUsSection";
import BookNowSection from "./sections/BookNowSection";
import TourPackagesSection from "./sections/TourPackagesSection";
import GallerySection from "./sections/GallerySection";
import {
  MNEMBA_IMAGES,
  TUMBATU_IMAGES,
  SUNSET_IMAGES,
  VALUE_PROPS,
  getTourPackages,
} from "./constants/tourData";
import "./DreamDhow.scss";

const DreamDhow = () => {
  useScrollToTop();

  // Shuffle images once on mount
  const shuffledMnembaImages = useMemo(
    () => [...MNEMBA_IMAGES].sort(() => 0.5 - Math.random()),
    []
  );
  const shuffledSunsetImages = useMemo(
    () => [...SUNSET_IMAGES].sort(() => 0.5 - Math.random()),
    []
  );
  const mainGalleryList = useMemo(
    () => [...MNEMBA_IMAGES, ...TUMBATU_IMAGES, ...SUNSET_IMAGES],
    []
  );
  const shuffledGalleryImages = useMemo(
    () => [...mainGalleryList].sort(() => 0.5 - Math.random()),
    [mainGalleryList]
  );

  // Get tour packages with shuffled images
  const tourPackages = getTourPackages(
    shuffledMnembaImages,
    TUMBATU_IMAGES,
    shuffledSunsetImages
  );

  return (
    <section className="dream-dhow-page">
      <HeroSection
        title="Dream Dhow Zanzibar"
        slogan="Sail into Paradise, feel the ocean breeze,<br />and make your Zanzibar story one to remember."
      />

      <ImagePreviewSection
        images={shuffledGalleryImages}
        basePath="/dreamdhow"
      />

      <ContentSection
        content="Experience the magic of Zanzibar's coastline aboard a traditional dhow. Choose a romantic sunset cruise or a group sail filled with laughter and views. Dream Dhow is more than a boat — it's your gateway to memories on the ocean."
      />

      <VideoSection
        title="Experience the Dream"
        videoUrl="https://www.youtube.com/embed/GNWH_dBIUtM"
      />

      <WhyBookUsSection
        title="🌊 Destination Paradise x DreamDhow 🌅"
        promoText='Book your DreamDhow experience through us and unlock <strong>exclusive discounts</strong> on transfers & tours across Zanzibar!'
        valueProps={VALUE_PROPS}
        footerText="✨ Good vibes. Great company. Pure paradise."
        whatsappLink="https://wa.me/message/YCOQDKJSDMXFD1"
      />

      <BookNowSection ctaText="Book Now" ctaLink="/booking" />

      <TourPackagesSection title="Our Tour Packages" tours={tourPackages} />

      <GallerySection
        title="Gallery"
        images={shuffledGalleryImages}
        basePath="/dreamdhow"
      />
    </section>
  );
};

export default DreamDhow;