export const ACCOUNT_SECTIONS = ["", "buchungen", "inserate", "nachrichten", "favoriten", "profil", "einstellungen", "admin"] as const;
export type AccountSection = (typeof ACCOUNT_SECTIONS)[number];
