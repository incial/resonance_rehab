import { teamData } from "@/data/teamData";

export const mergeImageOverrides = (members, imageOverrides = {}) =>
  members.map((member) => ({
    ...member,
    image: imageOverrides[member.slug] || member.image,
  }));

export const getMembersByCategory = (members, category) =>
  members.filter((member) => member.category === category);

export const getClinicalAndBehaviour = (members) => [
  ...getMembersByCategory(members, "clinical-psychologist"),
  ...getMembersByCategory(members, "behaviour-therapist"),
];

export const defaultMembers = teamData.allMembers;
