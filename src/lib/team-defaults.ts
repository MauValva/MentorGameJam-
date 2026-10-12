import type { TeamFormValues } from "./team-types";

export const emptyTeamForm = (): TeamFormValues => ({ name: "", gameName: "", themeId: "", description: "", notes: "", genre: "", engine: "", platform: "", dimension: "", camera: "", targetAudience: "", mainMechanic: "", gameDifferential: "", currentState: "", visualStyles: [], visualStyleOther: "", artisticIntent: "", plannedPalette: "", artTools: "", mainArtChallenge: "", members: [], references: [], artistMemberClientIds: [] });
