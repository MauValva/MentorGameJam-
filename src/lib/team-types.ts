export type TeamMemberDraft = { clientId: string; id?: string; name: string; role: string };
export type TeamReferenceDraft = { clientId: string; id?: string; name: string; description: string };

export type TeamFormValues = {
  name: string;
  gameName: string;
  themeId: string;
  description: string;
  notes: string;
  genre: string;
  engine: string;
  platform: string;
  dimension: string;
  camera: string;
  targetAudience: string;
  mainMechanic: string;
  gameDifferential: string;
  currentState: string;
  visualStyles: string[];
  visualStyleOther: string;
  artisticIntent: string;
  plannedPalette: string;
  artTools: string;
  mainArtChallenge: string;
  members: TeamMemberDraft[];
  references: TeamReferenceDraft[];
  artistMemberClientIds: string[];
};
