export type Subject = {
  name: string;
  notes: number;
  tone: "mint" | "amber" | "lavender" | "blue";
  code: string;
};

export const subjects: Subject[] = [
  { name: "Biology", notes: 4, tone: "mint", code: "BIO" },
  { name: "Chemistry", notes: 2, tone: "lavender", code: "CHE" },
  { name: "Physics", notes: 3, tone: "amber", code: "PHY" },
  { name: "Mathematics", notes: 5, tone: "blue", code: "MAT" },
  { name: "English", notes: 1, tone: "mint", code: "ENG" },
  { name: "Computer Science", notes: 2, tone: "lavender", code: "CS" },
  { name: "History", notes: 3, tone: "amber", code: "HIS" },
  { name: "Geography", notes: 4, tone: "blue", code: "GEO" },
  { name: "Economics", notes: 2, tone: "mint", code: "ECO" },
  { name: "Psychology", notes: 1, tone: "lavender", code: "PSY" },
  { name: "Other", notes: 0, tone: "amber", code: "OTH" },
];

/** Options for the subject filter on the notes page. */
export const subjectOptions = ["Biology", "Chemistry", "Physics","Mathematics", "English","Computer Science","History","Geography","Economics", "Psychology", "Other"];