import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeTeamCard from "@/shared/components/ui/HomeTeamCard";
import useTeamMembers from "@/features/team/hooks/useTeamMembers";

const FEATURED_MEMBER_CATEGORY = "clinical-psychologist";
const FEATURED_MEMBER_COUNT = 3;

const MeetOurTeam = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const { members } = useTeamMembers();
  const featuredMembers = members.filter(
    (member) => member.category === FEATURED_MEMBER_CATEGORY
  );
  const cards = (featuredMembers.length > 0 ? featuredMembers : members).slice(
    0,
    FEATURED_MEMBER_COUNT
  );

  const handleViewFullTeam = () => {
    navigate("/team");
    window.scrollTo(0, 0);
  };

  const handleSelectMember = (member) => {
    navigate(`/team/${member.slug}`);
  };

  return (
    <div ref={ref} className="min-h-0 md:min-h-screen bg-background relative z-20" data-section="meet-our-team">
      <div className="container-custom py-2 sm:py-4 md:py-12 px-4 sm:px-6">
        <div className="text-center mb-4 sm:mb-6 md:mb-12 mt-1 sm:mt-2 md:mt-16">
          <h1 className="font-autumn text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 relative inline-block">
            <span className="text-primary-color">Meet Our </span>
            <span className="text-secondary-color italic">Expert Team</span>
            <img
              src="/images/ConditionsWeSupport/underline.svg"
              alt=""
              className="absolute -bottom-3 sm:-bottom-4 left-0 w-full h-3.5 sm:h-4.5"
            />
          </h1>
          <p className="font-urbanist text-secondary-color text-xs sm:text-sm max-w-2xl mx-auto mt-3 sm:mt-4 px-4 sm:px-0">
            Our certified therapists are here to guide, support, and help your
            child grow, one step at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6 md:mb-12 max-w-6xl mx-auto">
          {cards.map((member) => (
            <HomeTeamCard
              key={member.id}
              member={member}
              onClick={() => handleSelectMember(member)}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleViewFullTeam}
            className="bg-button-main text-primary-color font-urbanist font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:opacity-90 active:opacity-80 transition-opacity text-xs sm:text-sm focus-ring shadow-md active:scale-95 w-full sm:w-auto max-w-xs sm:max-w-none"
            aria-label="View complete team member directory"
          >
            View Full Team
          </button>
        </div>
      </div>
    </div>
  );
});

MeetOurTeam.displayName = "MeetOurTeam";

export default MeetOurTeam;
