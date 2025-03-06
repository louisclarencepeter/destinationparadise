import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import safariData from "../../../../assets/data/safarisdata/safariData";
import { safariPackages } from "../packages/safariPackageData";
import SafariHeader from "./components/SafariHeader";
import SafariContent from "./components/SafariContent";
import RelatedSafaris from "./components/RelatedSafaris";
import LoadingSpinner from "../common/LoadingSpinner";
import NotFound from "../common/NotFound";
import "./SafariInfo.scss";

const SafariInfo = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const safari = safariData.find((item) => item.title === title);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    window.scrollTo(0, 0);

    if (safari) {
      const getRelatedPackages = () => {
        const currentTitle = safari.title.toLowerCase();
        const currentDescription = (safari.fullDescription || safari.description || '').toLowerCase();
        const locations = [
          'serengeti', 'ngorongoro', 'tarangire', 'manyara', 'lake manyara',
          'zanzibar', 'selous', 'nyerere', 'ruaha', 'mikumi', 'mahale'
        ];
        const mentionedLocations = locations.filter(loc => 
          currentTitle.includes(loc) || currentDescription.includes(loc)
        );
        const isMultiDay = currentTitle.includes('day') || 
                          currentDescription.includes('day') ||
                          (safari.duration && safari.duration.includes('day'));
        const isZanzibar = currentTitle.includes('zanzibar') || 
                          currentDescription.includes('zanzibar');

        return safariPackages
          .filter(pkg => {
            if (pkg.title === safari.title) return false;
            const pkgDestinations = pkg.destinations.toLowerCase();
            if (mentionedLocations.length > 0) {
              return mentionedLocations.some(loc => pkgDestinations.includes(loc));
            }
            if (isZanzibar && pkgDestinations.includes('zanzibar')) return true;
            const pkgIsMultiDay = !pkg.duration.toLowerCase().includes('1 day');
            return isMultiDay === pkgIsMultiDay;
          })
          .sort((a, b) => {
            const aMatches = mentionedLocations.filter(loc => 
              a.destinations.toLowerCase().includes(loc)).length;
            const bMatches = mentionedLocations.filter(loc => 
              b.destinations.toLowerCase().includes(loc)).length;
            return bMatches - aMatches;
          })
          .slice(0, 3);
      };
      setRelatedPackages(getRelatedPackages());
    }

    return () => clearTimeout(timer);
  }, [safari]);

  if (loading) return <LoadingSpinner />;
  if (!safari) return <NotFound onBack={() => navigate("/safaris")} />;

  return (
    <div className="safari-info-container">
      <SafariHeader title={safari.title} subtitle={safari.subtitle} />
      <SafariContent safari={safari} onNavigate={navigate} />
      {relatedPackages.length > 0 && <RelatedSafaris packages={relatedPackages} />}
      <button 
          onClick={() => navigate("/safaris")} 
          className="back-button button-equal-width"
        >
          Back to Safaris
        </button>
    </div>
  );
};

export default SafariInfo;