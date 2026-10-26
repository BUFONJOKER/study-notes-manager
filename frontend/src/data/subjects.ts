export type Subject = {
  name: string;
  notes: number;
  tone: "mint" | "amber" | "lavender" | "blue";
  code: string;
};

export const subjects: Subject[] = [
  { name: "Biology", notes: 4, tone: "mint", code: "BIO" },
  { name: "History", notes: 3, tone: "amber", code: "HIS" },
  { name: "Chemistry", notes: 2, tone: "lavender", code: "CHE" },
  { name: "Mathematics", notes: 2, tone: "blue", code: "MAT" },
];

/** Options for the subject filter on the notes page. */
export const subjectOptions = ["Biology", "History", "Chemistry", "Mathematics", "Psychology"];