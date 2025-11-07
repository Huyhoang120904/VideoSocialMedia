export enum FeedItemType {
  VIDEO = "VIDEO",
  IMAGE_SLIDE = "IMAGE_SLIDE",
  USER_DETAIL = "USER_DETAIL",
}

export enum ReportCategory {
  // Content-related
  NUDITY = "NUDITY",
  VIOLENCE = "VIOLENCE",
  HATE_SPEECH = "HATE_SPEECH",
  HARASSMENT_OR_BULLYING = "HARASSMENT_OR_BULLYING",
  SPAM_OR_SCAM = "SPAM_OR_SCAM",
  COPYRIGHT_VIOLATION = "COPYRIGHT_VIOLATION",
  MISINFORMATION = "MISINFORMATION",
  SELF_HARM_OR_SUICIDE = "SELF_HARM_OR_SUICIDE",
  ANIMAL_ABUSE = "ANIMAL_ABUSE",
  DRUGS_OR_WEAPONS = "DRUGS_OR_WEAPONS",
  GRAPHIC_CONTENT = "GRAPHIC_CONTENT",

  // Behavioral or account issues
  IMPERSONATION = "IMPERSONATION",
  FAKE_ACCOUNT = "FAKE_ACCOUNT",
  CHILD_EXPLOITATION = "CHILD_EXPLOITATION",
  PRIVACY_VIOLATION = "PRIVACY_VIOLATION",
  TERRORISM_OR_EXTREMISM = "TERRORISM_OR_EXTREMISM",

  // Specific reasons
  OTHER = "OTHER",
}

export interface ReportTicketRequest {
  feedItemType: FeedItemType;
  targetId: string;
  reportCategory: ReportCategory;
  violationContent?: string;
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  [ReportCategory.NUDITY]: "Nudity",
  [ReportCategory.VIOLENCE]: "Violence",
  [ReportCategory.HATE_SPEECH]: "Hate Speech",
  [ReportCategory.HARASSMENT_OR_BULLYING]: "Harassment or Bullying",
  [ReportCategory.SPAM_OR_SCAM]: "Spam or Scam",
  [ReportCategory.COPYRIGHT_VIOLATION]: "Copyright Violation",
  [ReportCategory.MISINFORMATION]: "Misinformation",
  [ReportCategory.SELF_HARM_OR_SUICIDE]: "Self-harm or Suicide",
  [ReportCategory.ANIMAL_ABUSE]: "Animal Abuse",
  [ReportCategory.DRUGS_OR_WEAPONS]: "Drugs or Weapons",
  [ReportCategory.GRAPHIC_CONTENT]: "Graphic Content",
  [ReportCategory.IMPERSONATION]: "Impersonation",
  [ReportCategory.FAKE_ACCOUNT]: "Fake Account",
  [ReportCategory.CHILD_EXPLOITATION]: "Child Exploitation",
  [ReportCategory.PRIVACY_VIOLATION]: "Privacy Violation",
  [ReportCategory.TERRORISM_OR_EXTREMISM]: "Terrorism or Extremism",
  [ReportCategory.OTHER]: "Other",
};

