export type ContentType =
  | "YouTube"
  | "Twitter / X"
  | "GitHub"
  | "LinkedIn"
  | "Website"
  | "Article"
  | "Notes"
  | "PDF"
  | "Image"
  | "Document"
  | "Other";

export type ReadingStatus = "To Read" | "Reading" | "Completed";

export interface Content {
  id: string;
  _id?: string; // fallback for backend compatibility
  title: string;
  description: string;
  link: string;
  type: ContentType;
  category: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  // new fields:
  collectionId?: string | null;
  tags: string[];
  pinned: boolean;
  status: ReadingStatus;
}

export interface CreateContentInput {
  title: string;
  description?: string;
  link?: string;
  type: ContentType;
  category?: string;
  favorite?: boolean;
  collectionId?: string | null;
  tags?: string[];
  pinned?: boolean;
  status?: ReadingStatus;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  id: string;
}
