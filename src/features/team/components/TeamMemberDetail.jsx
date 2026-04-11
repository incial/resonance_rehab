import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useTeamMembers from "@/features/team/hooks/useTeamMembers";
const phoneNumber = "918921065634";

const openWhatsAppForMember = (memberName) => {
  const message = encodeURIComponent(
    `Hi, I would like to book a session with ${memberName}. Please share the available slots.`
  );

  window.open(
    `https://wa.me/${phoneNumber}?text=${message}`,
    "_blank"
  );
};


const TeamMemberDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { members, loading } = useTeamMembers();

  // Find member across all categories
  const member = members.find((m) => m.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-primary-color font-urbanist text-base">Loading profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-color mb-4">
            Team Member Not Found
          </h2>
          <button
            onClick={() => navigate("/team")}
            className="text-secondary-color hover:underline text-sm sm:text-base"
          >
            Back to Team List
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate("/team");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-6 sm:py-8 mt-12 sm:mt-16 px-4 sm:px-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-secondary-color text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-urbanist font-medium text-xs sm:text-sm mb-8 sm:mb-12 hover:opacity-90 active:opacity-80 transition-opacity shadow-md active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
          {/* Left Column - Profile Card & Info */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md mb-5 sm:mb-6 w-full sm:max-w-sm mx-auto lg:mx-0">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 sm:h-72 md:h-80 object-cover"
              />
              <div className="p-5 sm:p-6 bg-cream">
                <h2 className="font-urbanist text-base sm:text-lg font-bold text-primary-color mb-1">
                  {member.name}
                </h2>
                <p className="font-urbanist text-secondary-color font-bold text-xs sm:text-sm mb-2 sm:mb-3">
                  {member.title}
                </p>
                <p className="font-urbanist italic text-primary-color text-xs leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>

            {/* Credentials Section */}
            <div className="space-y-1.5 mb-5 sm:mb-6 w-full sm:max-w-sm mx-auto lg:mx-0 px-2 sm:px-0">
              <p className="font-urbanist text-primary-color text-xs sm:text-sm">
                Credentials:{" "}
                <span className="font-semibold">{member.credentials}</span>
              </p>
              <p className="font-urbanist text-primary-color text-xs sm:text-sm">
                Age Groups: <span className="font-semibold">{member.age}</span>
              </p>
              <p className="font-urbanist text-primary-color text-xs sm:text-sm">
                Languages:{" "}
                <span className="font-semibold">{member.languages}</span>
              </p>
            </div>

            {/* Book Session CTA */}
            <div className="w-full sm:max-w-sm mx-auto lg:mx-0 px-2 sm:px-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <p className="font-urbanist text-primary-color text-xs sm:text-sm font-semibold text-center sm:text-left">
                  Book a session with
                  <br className="hidden sm:inline" />
                  <span className="sm:hidden"> </span>
                  {member.name.split(" ")[0]} today.
                </p>
             <button
  onClick={() => openWhatsAppForMember(member.name)}
  className="bg-button-main text-primary-color font-urbanist font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6 rounded-full hover:opacity-90 active:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 w-full sm:w-auto shadow-md active:scale-95"
>
  Book a session
</button>

              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-3 space-y-8 sm:space-y-10">
            {/* About Section */}
            <div>
              <h2 className="font-urbanist text-secondary-color text-2xl sm:text-3xl font-normal mb-3 sm:mb-4">
                About {member.name.split(" ")[0]}
              </h2>
              <p className="font-urbanist text-primary-color text-sm sm:text-base leading-relaxed">
                {member.about}
              </p>
            </div>

            {/* Areas of Focus Section */}
            <div>
              <h2 className="font-urbanist text-secondary-color text-2xl sm:text-3xl font-normal mb-4 sm:mb-6">
                Areas of Focus
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {member.areasOfFocus.map((area, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-secondary-color rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="font-urbanist text-primary-color text-sm sm:text-base leading-relaxed">
                      {area}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Approach to Therapy Section */}
            <div>
              <h2 className="font-urbanist text-secondary-color text-2xl sm:text-3xl font-normal mb-4 sm:mb-6">
                Their Approach to Therapy
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {member.approach.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-secondary-color rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></span>
                    <span className="font-urbanist text-primary-color text-sm sm:text-base leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetail;
