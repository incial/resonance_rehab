import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useTeamMembers from "@/features/team/hooks/useTeamMembers";
import {
  getClinicalAndBehaviour,
  getMembersByCategory,
} from "@/features/team/utils/teamMembers";

const TeamCard = ({ member, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onClick();
    }}
    className="bg-cream rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-95 focus-ring"
    aria-label={`View ${member.name}'s profile - ${member.title}`}
  >
    <img
      src={member.image}
      alt={member.name}
      className="w-full h-56 sm:h-64 md:h-72 object-cover"
    />
    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
      <h3 className="font-urbanist text-base sm:text-lg md:text-xl font-bold text-primary-color mb-1 sm:mb-1.5 md:mb-2">
        {member.name}
      </h3>
      <p className="font-urbanist text-secondary-color font-bold text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4">
        {member.title}
      </p>
      <p className="font-urbanist italic text-primary-color text-xs sm:text-sm leading-relaxed">
        {member.description}
      </p>
    </div>
  </div>
);

const TeamList = () => {
  const navigate = useNavigate();
  const { members } = useTeamMembers();

  const handleSelectMember = (member) => {
    navigate(`/team/${member.slug}`);
  };

  const handleBack = () => {
    navigate("/");
    // Scroll to Meet Our Team section after navigation
    setTimeout(() => {
      const meetOurTeamSection = document.querySelector('[data-section="meet-our-team"]');
      if (meetOurTeamSection) {
        meetOurTeamSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Get members by category
  const clinicalPsychologistsAndBehaviourTherapists =
    getClinicalAndBehaviour(members);
  const occupationalTherapists = getMembersByCategory(members, "occupational");
  const speechPathologists = getMembersByCategory(members, "speech");
  const specialEducators = getMembersByCategory(members, "special-educator");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-6 sm:py-8 mt-12 sm:mt-16 px-4 sm:px-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-secondary-color text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-urbanist font-medium text-xs sm:text-sm mb-8 sm:mb-12 hover:opacity-90 active:opacity-80 transition-opacity focus-ring shadow-md active:scale-95"
          aria-label="Go back to Meet Our Team section"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-autumn text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 relative inline-block px-2">
            <span className="text-primary-color">Meet Our </span>
            <span className="text-secondary-color italic relative">
              Expert Team
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-6 sm:h-8"
                viewBox="0 0 400 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M10,15 Q100,8 200,12 T390,15"
                  stroke="#DAE562"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M20,18 Q110,11 210,15 T400,18"
                  stroke="#DAE562"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </span>
          </h1>
          <p className="font-urbanist text-secondary-color text-xs sm:text-sm max-w-2xl mx-auto mt-6 sm:mt-8 px-4">
            Our certified therapists are here to guide, support, and help your
            child grow, one step at a time.
          </p>
        </div>

        <section className="mb-12 sm:mb-16">
          <h2 className="font-urbanist text-secondary-color font-semibold text-center mb-6 sm:mb-8 text-base sm:text-lg px-4">
            Clinical Psychologist & Behaviour Therapist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {clinicalPsychologistsAndBehaviourTherapists.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                onClick={() => handleSelectMember(member)}
              />
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-16">
          <h2 className="font-urbanist text-secondary-color font-semibold text-center mb-6 sm:mb-8 text-base sm:text-lg px-4">
            Occupational Therapist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {occupationalTherapists.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                onClick={() => handleSelectMember(member)}
              />
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-16">
          <h2 className="font-urbanist text-secondary-color font-semibold text-center mb-6 sm:mb-8 text-base sm:text-lg px-4">
            Speech and Hearing Language Pathologist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {speechPathologists.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                onClick={() => handleSelectMember(member)}
              />
            ))}
          </div>
        </section>

        {specialEducators.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="font-urbanist text-secondary-color font-semibold text-center mb-6 sm:mb-8 text-base sm:text-lg px-4">
              Developmental Therapist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {specialEducators.map((member) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  onClick={() => handleSelectMember(member)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TeamList;
