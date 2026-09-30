import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type IconName =
  | "home"
  | "notes"
  | "plus"
  | "sparkle"
  | "search"
  | "chevron"
  | "arrow"
  | "more"
  | "edit"
  | "trash"
  | "copy"
  | "check"
  | "book"
  | "clock"
  | "menu"
  | "user"
  | "close"
  | "refresh"
  | "download"
  | "alert"
  | "key"
  | "eye"
  | "eyeOff"
  | "lock";

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></>,
  notes: <><path d="M6 3h10l3 3v15H6z"/><path d="M16 3v4h4"/><path d="M9 11h6M9 15h6"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  sparkle: <><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8z"/><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7zM19 3l.6 1.4L21 5l-1.4.6L19 7l-.6-1.4L17 5l1.4-.6z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  chevron: <path d="m9 7 5 5-5 5"/>,
  arrow: <path d="m15 18-6-6 6-6"/>,
  more: <><circle cx="5" cy="12" r=".7" fill="currentColor"/><circle cx="12" cy="12" r=".7" fill="currentColor"/><circle cx="19" cy="12" r=".7" fill="currentColor"/></>,
  edit: <><path d="m14 5 5 5"/><path d="m17 3 4 4L9 19l-6 2 2-6z"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  book: <><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M7 16h11M7 4v12"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-5L3 9"/><path d="M3 4v5h5M4 13a8 8 0 0 0 14 5l3-3"/><path d="M21 20v-5h-5"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 20h14"/></>,
  alert: <><path d="M12 3 2.5 20h19z"/><path d="M12 9v5m0 3v.2"/></>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 2 2m-5 1 2 2"/></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="m3 3 18 18"/><path d="M10.7 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.7M6.3 6.3C3.9 8 2.5 12 2.5 12s3.5 6 9.5 6c1.3 0 2.5-.3 3.5-.7"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

type Note = {
  id: string;
  title: string;
  subject: string;
  updated: string;
  created: string;
  content: string;
  tone: string;
  hasQuiz?: boolean;
};

const initialNotes: Note[] = [
  {
    id: "BIO-204-07",
    title: "Cellular Respiration & Energy",
    subject: "Biology",
    updated: "Today, 10:24 AM",
    created: "Sep 18, 2024",
    tone: "mint",
    hasQuiz: true,
    content: "Cellular respiration is the process cells use to convert glucose into usable energy in the form of ATP.\n\nGlycolysis\nGlycolysis occurs in the cytoplasm and does not require oxygen. One glucose molecule is split into two pyruvate molecules, producing a net gain of 2 ATP and 2 NADH.\n\nThe Citric Acid Cycle\nIn the mitochondrial matrix, acetyl-CoA enters a cycle of reactions that releases carbon dioxide and transfers energy to NADH and FADH₂.\n\nOxidative Phosphorylation\nThe electron transport chain creates a proton gradient across the inner mitochondrial membrane. ATP synthase uses this gradient to produce approximately 26–28 ATP. Oxygen acts as the final electron acceptor, combining with electrons and hydrogen ions to form water.",
  },
  {
    id: "HIST-112-03",
    title: "The Industrial Revolution",
    subject: "History",
    updated: "Yesterday, 4:18 PM",
    created: "Sep 14, 2024",
    tone: "amber",
    content: "The Industrial Revolution marked the transition to new manufacturing processes in Europe and the United States.",
  },
  {
    id: "CHEM-301-12",
    title: "Organic Chemistry: Functional Groups",
    subject: "Chemistry",
    updated: "Sep 20, 2024",
    created: "Sep 10, 2024",
    tone: "lavender",
  content: "Functional groups are specific groups of atoms within molecules that determine characteristic chemical reactions.",
  },
  {
    id: "MATH-220-08",
    title: "Integration Techniques",
    subject: "Mathematics",
    updated: "Sep 18, 2024",
    created: "Sep 8, 2024",
    tone: "blue",
    content: "Integration by parts, trigonometric substitution, and partial fractions are key methods for finding antiderivatives.",
  },
  {
    id: "PSY-101-04",
    title: "Memory & Cognitive Processing",
    subject: "Psychology",
    updated: "Sep 16, 2024",
    created: "Sep 2, 2024",
    tone: "rose",
    content: "Memory involves encoding, storage, and retrieval of information.",
  },
];

type Screen = "dashboard" | "notes" | "create" | "detail" | "edit" | "progress" | "quiz" | "users";

function Button({ children, variant = "primary", icon, onClick, type = "button", className = "", disabled = false }: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  return <button type={type} disabled={disabled} className={`btn btn-${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} size={18}/>}<span>{children}</span></button>;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Brand() {
  return <div className="brand"><div className="brand-mark"><Icon name="book" size={21}/></div><div><strong>Noteflow</strong><span>Study workspace</span></div></div>;
}

function Sidebar({ screen, go, apiConfigured, onApi }: { screen: Screen; go: (s: Screen) => void; apiConfigured: boolean; onApi: () => void }) {
  return <aside className="sidebar">
    <Brand/>
    <nav className="side-nav" aria-label="Main navigation">
      <button className={screen === "dashboard" ? "active" : ""} onClick={() => go("dashboard")}><Icon name="home"/><span>Dashboard</span></button>
      <button className={["notes", "detail", "edit"].includes(screen) ? "active" : ""} onClick={() => go("notes")}><Icon name="notes"/><span>All notes</span><span className="nav-count">12</span></button>
      <button className={screen === "quiz" || screen === "progress" ? "active" : ""} onClick={() => go("quiz")}><Icon name="sparkle"/><span>Quiz library</span></button>
    </nav>
    <div className="side-section">
      <span className="eyebrow">Subjects</span>
      <button><i className="subject-dot dot-mint"/>Biology<span>4</span></button>
      <button><i className="subject-dot dot-amber"/>History<span>3</span></button>
      <button><i className="subject-dot dot-lavender"/>Chemistry<span>2</span></button>
      <button><i className="subject-dot dot-blue"/>Mathematics<span>2</span></button>
    </div>
    <div className={`sidebar-tip api-tip ${apiConfigured ? "configured" : ""}`}>
      <div className="tip-icon"><Icon name={apiConfigured ? "check" : "key"} size={17}/></div>
      <strong>{apiConfigured ? "AI is ready" : "Connect OpenAI"}</strong>
      <p>{apiConfigured ? "API key configured for this session." : "Add an API key to generate quizzes."}</p>
      <button onClick={onApi}>{apiConfigured ? "Manage API key" : "Set up API key"} <Icon name="chevron" size={14}/></button>
    </div>
    <button className="profile" onClick={() => go("users")}><span className="avatar">AM</span><span><strong>Alex Morgan</strong><small>@alexm</small></span><Icon name="more"/></button>
  </aside>;
}

function Header({ title, onMenu, go, apiConfigured, onApi }: { title: string; onMenu: () => void; go: (s: Screen) => void; apiConfigured: boolean; onApi: () => void }) {
  return <header className="topbar">
    <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open menu"><Icon name="menu"/></button>
    <div className="mobile-brand"><Brand/></div>
    <span className="topbar-title">{title}</span>
    <div className="top-actions">
      <button className={`api-status ${apiConfigured ? "ready" : ""}`} onClick={onApi}><i/><Icon name={apiConfigured ? "check" : "lock"} size={14}/><span>{apiConfigured ? "AI ready" : "AI locked"}</span></button>
      <label className="global-search"><Icon name="search" size={18}/><input aria-label="Search all notes" placeholder="Search anything..."/><kbd>⌘ K</kbd></label>
      <Button icon="plus" onClick={() => go("create")}>New note</Button>
      <button className="avatar mobile-avatar" onClick={() => go("users")}>AM</button>
    </div>
  </header>;
}

function MobileNav({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  return <nav className="mobile-nav">
    <button className={screen === "dashboard" ? "active" : ""} onClick={() => go("dashboard")}><Icon name="home"/><span>Home</span></button>
    <button className={["notes", "detail", "edit"].includes(screen) ? "active" : ""} onClick={() => go("notes")}><Icon name="notes"/><span>Notes</span></button>
    <button className="mobile-create" onClick={() => go("create")}><span><Icon name="plus"/></span><small>Create</small></button>
    <button className={["progress", "quiz"].includes(screen) ? "active" : ""} onClick={() => go("quiz")}><Icon name="sparkle"/><span>Quizzes</span></button>
    <button onClick={() => go("users")}><Icon name="user"/><span>Profile</span></button>
  </nav>;
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function Dashboard({ go, notes, onAi, apiConfigured }: { go: (s: Screen) => void; notes: Note[]; onAi: () => void; apiConfigured: boolean }) {
  return <div className="page">
    <PageHeading eyebrow="Monday, September 23" title="Good morning, Alex" description="Here’s what’s happening in your study space.">
      <Button variant="secondary" icon={apiConfigured ? "sparkle" : "lock"} onClick={onAi}>Generate quiz</Button>
      <Button icon="plus" onClick={() => go("create")}>Create note</Button>
    </PageHeading>

    <section className="stats-grid" aria-label="Study overview">
      <article className="stat-card"><div className="stat-icon green"><Icon name="notes"/></div><div><span>Total notes</span><strong>{notes.length + 7}</strong><small><b>+3</b> this month</small></div></article>
      <article className="stat-card"><div className="stat-icon gold"><Icon name="book"/></div><div><span>Subjects</span><strong>5</strong><small>Across this semester</small></div></article>
      <article className="stat-card"><div className="stat-icon purple"><Icon name="sparkle"/></div><div><span>Generated quizzes</span><strong>8</strong><small><b>+2</b> this week</small></div></article>
      <article className="stat-card"><div className="stat-icon blue"><Icon name="clock"/></div><div><span>Recently updated</span><strong>4</strong><small>In the last 7 days</small></div></article>
    </section>

    <div className="dashboard-grid">
      <section className="panel recent-panel">
        <div className="panel-header"><div><h2>Recently updated</h2><p>Pick up where you left off</p></div><button className="text-button" onClick={() => go("notes")}>View all <Icon name="chevron" size={15}/></button></div>
        <div className="recent-list">
          {notes.slice(0, 4).map((note) => <button className="recent-row" key={note.id} onClick={() => go("detail")}>
            <span className={`note-glyph ${note.tone}`}><Icon name="notes" size={20}/></span>
            <span className="recent-main"><strong>{note.title}</strong><span><Badge tone={note.tone}>{note.subject}</Badge><small>{note.updated}</small></span></span>
            {note.hasQuiz && <span className="quiz-ready"><Icon name="sparkle" size={14}/> Quiz ready</span>}
            <Icon name="chevron" size={18}/>
          </button>)}
        </div>
      </section>

      <section className="panel activity-panel">
        <div className="panel-header"><div><h2>Study activity</h2><p>Notes updated this week</p></div><select aria-label="Activity period"><option>This week</option><option>This month</option></select></div>
        <div className="chart">
          {[30, 58, 44, 78, 53, 88, 38].map((value, i) => <div className="bar-wrap" key={i}><div className={`bar ${i === 5 ? "peak" : ""}`} style={{height: `${value}%`}}/><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}
        </div>
        <div className="activity-foot"><span><i className="subject-dot dot-mint"/>8 notes updated</span><strong>Most active on Saturday</strong></div>
      </section>
    </div>

    <section className="panel subjects-panel">
      <div className="panel-header"><div><h2>Your subjects</h2><p>A snapshot of your notes by course</p></div><button className="text-button" onClick={() => go("notes")}>Manage subjects <Icon name="chevron" size={15}/></button></div>
      <div className="subject-cards">
        {[
          ["Biology", "4 notes", "mint", "BIO"],
          ["History", "3 notes", "amber", "HIS"],
          ["Chemistry", "2 notes", "lavender", "CHE"],
          ["Mathematics", "2 notes", "blue", "MAT"],
        ].map(([name,count,tone,code]) => <button key={name} onClick={() => go("notes")} className={`subject-card ${tone}`}><span className="subject-code">{code}</span><span><strong>{name}</strong><small>{count}</small></span><Icon name="chevron" size={17}/></button>)}
      </div>
    </section>
  </div>;
}

function NotesPage({ notes, go, onDelete, onAi, apiConfigured }: { notes: Note[]; go: (s: Screen) => void; onDelete: (n: Note) => void; onAi: () => void; apiConfigured: boolean }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const visible = useMemo(() => notes.filter(n => (subject === "All subjects" || n.subject === subject) && `${n.title} ${n.subject} ${n.id}`.toLowerCase().includes(query.toLowerCase())), [notes, query, subject]);
  return <div className="page">
    <PageHeading title="All notes" description="Search, organize, and manage everything you’re learning.">
      <Button icon="plus" onClick={() => go("create")}>Create note</Button>
    </PageHeading>
    <div className="toolbar">
      <label className="search-field"><Icon name="search" size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title, subject, or note ID..."/></label>
      <select value={subject} onChange={e => setSubject(e.target.value)} aria-label="Filter by subject"><option>All subjects</option><option>Biology</option><option>History</option><option>Chemistry</option><option>Mathematics</option><option>Psychology</option></select>
      <select aria-label="Sort notes"><option>Recently updated</option><option>Recently created</option><option>Title A–Z</option></select>
    </div>
    <div className="results-line"><span><strong>{visible.length}</strong> notes</span><span>Updated moments ago</span></div>
    {visible.length ? <div className="notes-table panel">
      <div className="table-head"><span>Note</span><span>Subject</span><span>Updated</span><span>Note ID</span><span>Actions</span></div>
      {visible.map(note => <div className="note-table-row" key={note.id}>
        <button className="note-title-cell" onClick={() => go("detail")}><span className={`note-glyph ${note.tone}`}><Icon name="notes" size={20}/></span><span><strong>{note.title}</strong><small>Created {note.created}</small></span></button>
        <span><Badge tone={note.tone}>{note.subject}</Badge></span>
        <span className="muted">{note.updated}</span>
        <code>{note.id}</code>
        <span className="row-actions">
          <button title={apiConfigured ? "Generate quiz" : "Add an API key to generate a quiz"} aria-disabled={!apiConfigured} className={!apiConfigured ? "ai-action-locked" : ""} onClick={onAi}><Icon name={apiConfigured ? "sparkle" : "lock"} size={18}/></button>
          <button title="Edit note" onClick={() => go("edit")}><Icon name="edit" size={18}/></button>
          <button title="Delete note" onClick={() => onDelete(note)}><Icon name="trash" size={18}/></button>
          <button title="More actions"><Icon name="more" size={18}/></button>
        </span>
      </div>)}
    </div> : <div className="empty panel"><span className="empty-icon"><Icon name="search"/></span><h2>No notes found</h2><p>Try another search or clear your filters to see more notes.</p><Button variant="secondary" onClick={() => {setQuery("");setSubject("All subjects")}}>Clear filters</Button></div>}
  </div>;
}

function NoteForm({ mode, note, go, onSave, existingIds = [] }: { mode: "create" | "edit"; note?: Note; go: (s: Screen) => void; onSave: (n: Note) => void; existingIds?: string[] }) {
  const [form, setForm] = useState({ username: "alexm", id: note?.id || "", title: note?.title || "", subject: note?.subject || "", content: note?.content || "" });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const duplicateId = mode === "create" && existingIds.includes(form.id.trim().toUpperCase());
  const update = (field: keyof typeof form, value: string) => setForm({...form, [field]: value});
  const submit = (e: FormEvent) => {
    e.preventDefault(); setSubmitted(true);
    if (!form.id || !form.title || !form.subject || !form.content || duplicateId) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ id: form.id, title: form.title, subject: form.subject, content: form.content, created: note?.created || "Today", updated: "Just now", tone: note?.tone || "mint" });
      setSaving(false); go("detail");
    }, 700);
  };
  const error = (field: keyof typeof form) => submitted && !form[field];
  return <div className="page narrow-page">
    <button className="back-link" onClick={() => go(mode === "edit" ? "detail" : "notes")}><Icon name="arrow" size={17}/> Back to {mode === "edit" ? "note" : "all notes"}</button>
    <PageHeading title={mode === "create" ? "Create a new note" : "Edit note"} description={mode === "create" ? "Capture what you’re learning and keep it organized." : "Update your study material. Changes are saved to this note."}/>
    {mode === "edit" && <div className="info-strip"><Icon name="clock" size={17}/><span>Last updated <strong>Today at 10:24 AM</strong></span><span className="save-status"><i/> All changes saved</span></div>}
    <form className="form-panel panel" onSubmit={submit}>
      <section>
        <div className="form-section-title"><span>1</span><div><h2>Note details</h2><p>Give your note a clear title and subject.</p></div></div>
        <div className="form-grid">
          {mode === "create" ? <label><span>Username <b>*</b></span><input value={form.username} onChange={e => update("username",e.target.value)} className={error("username") ? "invalid" : ""}/>{error("username") && <small className="field-error">Username is required</small>}</label> : <label><span>Username</span><input value={form.username} readOnly className="readonly"/><small>Owner cannot be changed</small></label>}
          <label><span>Note ID <b>*</b></span><input value={form.id} onChange={e => update("id",e.target.value.toUpperCase())} readOnly={mode === "edit"} className={mode === "edit" ? "readonly" : error("id") || duplicateId ? "invalid" : ""} placeholder="e.g. BIO-204-08"/><small>{mode === "edit" ? "Unique ID cannot be changed" : "Use a unique, memorable identifier"}</small>{error("id") && <small className="field-error">A unique note ID is required</small>}{duplicateId && <small className="field-error">This Note ID already exists. Try another unique ID.</small>}</label>
          <label className="span-two"><span>Note title <b>*</b></span><input value={form.title} onChange={e => update("title",e.target.value)} className={error("title") ? "invalid" : ""} placeholder="What is this note about?"/>{error("title") && <small className="field-error">Add a title for your note</small>}</label>
          <label className="span-two"><span>Subject <b>*</b></span><select value={form.subject} onChange={e => update("subject",e.target.value)} className={error("subject") ? "invalid" : ""}><option value="">Select a subject</option><option>Biology</option><option>History</option><option>Chemistry</option><option>Mathematics</option><option>Psychology</option><option>Other</option></select></label>
        </div>
      </section>
      <section>
        <div className="form-section-title"><span>2</span><div><h2>Study content</h2><p>Add your key ideas, explanations, and important details.</p></div></div>
        <label className="editor-label"><span>Note content <b>*</b><small>{form.content.length} characters</small></span><div className={`editor ${error("content") ? "invalid" : ""}`}><div className="editor-toolbar"><button type="button"><strong>B</strong></button><button type="button"><em>I</em></button><button type="button">H1</button><i/><button type="button">• List</button><button type="button">1. List</button></div><textarea value={form.content} onChange={e => update("content",e.target.value)} placeholder="Start writing your study notes here..."/></div>{error("content") && <small className="field-error">Note content cannot be empty</small>}</label>
      </section>
      <div className="form-actions"><span>Your note is private to your account.</span><div><Button variant="secondary" onClick={() => go(mode === "edit" ? "detail" : "notes")}>Cancel</Button><Button type="submit" icon={saving ? undefined : "check"} disabled={saving}>{saving ? "Saving…" : mode === "create" ? "Save note" : "Save changes"}</Button></div></div>
    </form>
  </div>;
}

function NoteDetail({ note, go, onDelete, onAi, apiConfigured }: { note: Note; go: (s: Screen) => void; onDelete: (n: Note) => void; onAi: () => void; apiConfigured: boolean }) {
  return <div className="page reading-page">
    <button className="back-link" onClick={() => go("notes")}><Icon name="arrow" size={17}/> Back to all notes</button>
    <div className="detail-heading">
      <div><Badge tone={note.tone}>{note.subject}</Badge><h1>{note.title}</h1><div className="detail-meta"><code>{note.id}</code><span>Created {note.created}</span><span>Updated {note.updated}</span></div></div>
      <div className="detail-actions"><Button variant="secondary" icon="edit" onClick={() => go("edit")}>Edit</Button><Button variant="secondary" icon="trash" onClick={() => onDelete(note)}>Delete</Button><Button icon={apiConfigured ? "sparkle" : "lock"} onClick={onAi}>Generate quiz</Button></div>
    </div>
    <div className="reading-layout">
      <article className="note-content panel">
        <div className="content-kicker">Study note</div>
        {note.content.split("\n\n").map((p, i) => i === 0 ? <p className="lead" key={p}>{p}</p> : p.includes("\n") ? <div key={p}>{p.split("\n").map((line,j) => j === 0 ? <h2 key={line}>{line}</h2> : <p key={line}>{line}</p>)}</div> : i % 2 ? <div key={p}><h2>{p}</h2></div> : <p key={p}>{p}</p>)}
        <div className="study-callout"><span><Icon name={apiConfigured ? "sparkle" : "lock"} size={18}/></span><div><strong>{apiConfigured ? "Ready to check your understanding?" : "OpenAI API key required"}</strong><p>{apiConfigured ? "Generate practice questions from this note in under a minute." : "Configure a valid key before using AI study tools."}</p></div><Button variant="secondary" onClick={onAi}>{apiConfigured ? "Create quiz" : "Set up AI"}</Button></div>
      </article>
      <aside className="note-outline">
        <span className="eyebrow">On this page</span>
        <a className="active">Overview</a><a>Glycolysis</a><a>Citric acid cycle</a><a>Oxidative phosphorylation</a>
        <div className="quiz-mini"><Icon name="check" size={18}/><div><strong>Quiz available</strong><p>10 questions generated</p><button onClick={() => go("quiz")}>View quiz <Icon name="chevron" size={14}/></button></div></div>
      </aside>
    </div>
  </div>;
}

const quizQuestions = [
  "What is the primary purpose of cellular respiration in living cells?",
  "Where in the cell does glycolysis occur, and does it require oxygen?",
  "What are the net products generated from one glucose molecule during glycolysis?",
  "How does pyruvate prepare to enter the citric acid cycle?",
  "What role do NADH and FADH₂ play in cellular respiration?",
  "Describe how the electron transport chain creates a proton gradient.",
  "What is the function of ATP synthase in oxidative phosphorylation?",
  "Why is oxygen essential to the electron transport chain?",
  "Approximately how many ATP molecules are produced through oxidative phosphorylation?",
  "Compare substrate-level phosphorylation with oxidative phosphorylation.",
];

function QuizProgress({ go }: { go: (s: Screen) => void }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStage(s => s < 4 ? s + 1 : s), 900);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { if (stage === 4) { const done = setTimeout(() => go("quiz"), 700); return () => clearTimeout(done); }}, [stage, go]);
  const stages = [["Analyzing note","Reading structure and context"],["Creating summary","Condensing the core ideas"],["Extracting key concepts","Finding important terms"],["Generating questions","Building your practice set"]];
  return <div className="page progress-page">
    <button className="back-link" onClick={() => go("detail")}><Icon name="arrow" size={17}/> Cancel and return to note</button>
    <div className="progress-card panel">
      <div className="orb"><Icon name="sparkle" size={31}/><span/><span/></div>
      <Badge tone="mint">AI quiz generator</Badge>
      <h1>{stage === 4 ? "Your quiz is ready" : "Creating your study quiz"}</h1>
      <p>Turning <strong>Cellular Respiration & Energy</strong> into focused practice questions.</p>
      <div className="progress-meter"><span style={{width: `${Math.min(100, (stage + .45) * 25)}%`}}/></div>
      <div className="progress-label"><span>{stage === 4 ? "Complete" : `${Math.round((stage + .45) * 25)}% complete`}</span><span>Usually takes less than a minute</span></div>
      <div className="stage-list">
        {stages.map(([title,desc], i) => <div className={`stage ${i < stage ? "done" : i === stage ? "current" : ""}`} key={title}>
          <span className="stage-status">{i < stage ? <Icon name="check" size={16}/> : i === stage ? <i/> : i + 1}</span>
          <div><strong>{title}</strong><small>{i === stage ? desc : i < stage ? "Complete" : "Waiting"}</small></div>
          {i === stage && <span className="working">Working…</span>}
        </div>)}
      </div>
      <div className="progress-note"><Icon name="sparkle" size={16}/><span>You can leave this screen. We’ll save the quiz to your note when it’s ready.</span></div>
    </div>
  </div>;
}

function QuizResults({ go, onAi, apiConfigured }: { go: (s: Screen) => void; onAi: () => void; apiConfigured: boolean }) {
  const [copied, setCopied] = useState(false);
  return <div className="page quiz-page">
    <button className="back-link" onClick={() => go("detail")}><Icon name="arrow" size={17}/> Return to note</button>
    <PageHeading eyebrow="Quiz generated successfully" title="Cellular Respiration & Energy" description="10 practice questions • Biology • Generated just now">
      <Button variant="secondary" icon={copied ? "check" : "copy"} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied" : "Copy all"}</Button>
      <Button variant="secondary" icon="download">Export</Button>
      <Button icon={apiConfigured ? "refresh" : "lock"} onClick={onAi}>Regenerate</Button>
    </PageHeading>
    <div className="quiz-layout">
      <main>
        <section className="summary-card panel">
          <div className="summary-icon"><Icon name="sparkle"/></div><div><span className="eyebrow">Analysis summary</span><h2>Aerobic energy production</h2><p>This note explains how cells convert glucose into ATP through three connected stages: glycolysis, the citric acid cycle, and oxidative phosphorylation. It emphasizes energy carriers, location, and oxygen’s essential role.</p></div>
        </section>
        <section className="questions panel">
          <div className="questions-head"><div><span className="eyebrow">Practice set</span><h2>Generated questions</h2></div><Badge tone="mint">10 questions</Badge></div>
          {quizQuestions.map((q, i) => <div className="question" key={q}><span>{String(i + 1).padStart(2,"0")}</span><p>{q}</p><button aria-label={`Copy question ${i+1}`}><Icon name="copy" size={17}/></button></div>)}
        </section>
      </main>
      <aside className="quiz-aside">
        <section className="panel concept-card"><span className="eyebrow">Key concepts</span><h3>What to review</h3><div className="concepts">{["ATP","Glycolysis","Pyruvate","NADH","Citric acid cycle","Electron transport chain","Proton gradient","ATP synthase","Oxygen"].map(x => <span key={x}>{x}</span>)}</div></section>
        <section className="panel generated-summary"><span className="eyebrow">Generated summary</span><h3>In a nutshell</h3><p>Glucose is gradually oxidized to transfer energy into ATP. Glycolysis begins the process; the citric acid cycle loads electron carriers; and the electron transport chain uses those electrons to power most ATP production.</p></section>
        <div className="quiz-actions-card"><Icon name="book"/><div><strong>Saved to your note</strong><p>You can return to this quiz anytime.</p></div></div>
      </aside>
    </div>
  </div>;
}

function UserSelection({ go, onEmpty }: { go: (s: Screen) => void; onEmpty: () => void }) {
  const [name, setName] = useState("");
  return <div className="welcome">
    <div className="welcome-brand"><Brand/></div>
    <div className="welcome-card">
      <span className="welcome-art"><Icon name="book" size={32}/><i/><i/></span>
      <span className="eyebrow">Welcome to Noteflow</span><h1>Your study space, organized.</h1><p>Select your profile or enter a username to continue.</p>
      <div className="profiles">
        <button onClick={() => go("dashboard")}><span className="avatar large">AM</span><span><strong>Alex Morgan</strong><small>@alexm • 12 notes</small></span><Icon name="chevron"/></button>
        <button onClick={() => go("dashboard")}><span className="avatar large alt">JS</span><span><strong>Jamie Singh</strong><small>@jamies • 7 notes</small></span><Icon name="chevron"/></button>
      </div>
      <div className="or"><span/>or continue with a username<span/></div>
      <label className="username-entry"><span>Username</span><div><Icon name="user" size={18}/><input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your username"/></div></label>
      <Button className="full" disabled={!name} onClick={() => { onEmpty(); go("dashboard"); }}>Continue <Icon name="chevron" size={16}/></Button>
      <small className="privacy">No password needed. Your notes stay connected to your username.</small>
    </div>
  </div>;
}

function DeleteModal({ note, close, confirm }: { note: Note; close: () => void; confirm: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={close}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close"/></button>
    <span className="danger-icon"><Icon name="trash"/></span><h2 id="delete-title">Delete this note?</h2><p>You’re about to permanently delete <strong>“{note.title}”</strong>. Its generated quiz will also be removed.</p>
    <div className="warning"><Icon name="alert" size={17}/><span>This action cannot be undone.</span></div>
    <div className="modal-actions"><Button variant="secondary" onClick={close}>Cancel</Button><Button variant="danger" icon="trash" onClick={confirm}>Delete note</Button></div>
  </div></div>;
}

function ApiKeyModal({ configured, close, onAccepted, onClear }: { configured: boolean; close: () => void; onAccepted: () => void; onClear: () => void }) {
  const [editing, setEditing] = useState(!configured);
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const verify = (event: FormEvent) => {
    event.preventDefault();
    const candidate = key.trim();
    if (!candidate) {
      setStatus("error");
      setMessage("Enter an OpenAI API key to continue.");
      return;
    }
    if (!candidate.startsWith("sk-") || candidate.length < 24) {
      setStatus("error");
      setMessage("This key format doesn’t look valid. Check the key and try again.");
      return;
    }
    setStatus("loading");
    setMessage("");
    window.setTimeout(() => {
      // The raw key is deliberately discarded after verification.
      setKey("");
      setVisible(false);
      setStatus("success");
      setMessage("API key accepted. AI study features are now available.");
      onAccepted();
    }, 1100);
  };

  const clear = () => {
    setKey("");
    setStatus("idle");
    setMessage("");
    setEditing(true);
    onClear();
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={close}>
    <div className="modal api-modal" role="dialog" aria-modal="true" aria-labelledby="api-title" onMouseDown={event => event.stopPropagation()}>
      <button className="modal-close" onClick={close} aria-label="Close"><Icon name="close"/></button>
      <span className={`api-modal-icon ${configured ? "connected" : ""}`}><Icon name={configured ? "check" : "key"}/></span>
      <div className="api-session-row"><span className={`session-dot ${configured ? "online" : ""}`}/><span>Session status</span><strong>{configured ? "API key configured" : "Not configured"}</strong></div>

      {!editing && configured ? <>
        <h2 id="api-title">OpenAI is connected</h2>
        <p>AI features are enabled for this browser session using <strong>gpt-5-nano</strong>. Your key is hidden and cannot be viewed.</p>
        <div className="secure-note"><Icon name="lock" size={17}/><div><strong>Your key stays private</strong><span>It is not displayed in the interface after setup.</span></div></div>
        <div className="modal-actions api-manage-actions"><Button variant="secondary" icon="key" onClick={() => setEditing(true)}>Update key</Button><Button variant="danger" icon="trash" onClick={clear}>Clear key</Button></div>
      </> : status === "success" ? <>
        <h2 id="api-title">You’re ready to study</h2>
        <p>{message}</p>
        <div className="api-success"><Icon name="check"/><div><strong>Connection verified</strong><span>Model: gpt-5-nano</span></div></div>
        <Button className="full" onClick={close}>Continue to AI features</Button>
      </> : <>
        <h2 id="api-title">{configured ? "Update API key" : "Set up AI features"}</h2>
        <p>Enter your OpenAI API key to generate quizzes and use AI study tools. The application uses <strong>gpt-5-nano</strong>.</p>
        <form onSubmit={verify}>
          <label className="api-key-field">
            <span>OpenAI API key</span>
            <div className={status === "error" ? "invalid" : ""}>
              <Icon name="key" size={18}/>
              <input type={visible ? "text" : "password"} value={key} onChange={event => { setKey(event.target.value); if (status === "error") setStatus("idle"); }} autoComplete="off" spellCheck={false} placeholder="sk-••••••••••••••••••••••••" aria-invalid={status === "error"}/>
              <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "Hide API key" : "Show API key"}><Icon name={visible ? "eyeOff" : "eye"} size={18}/></button>
            </div>
          </label>
          {status === "error" && <div className="api-feedback error" role="alert"><Icon name="alert" size={17}/><span>{message}</span></div>}
          {status === "loading" && <div className="api-feedback loading" role="status"><i/><span>Verifying your key with OpenAI…</span></div>}
          <div className="secure-note"><Icon name="lock" size={17}/><div><strong>Secure by design</strong><span>Your key is discarded from the form after verification and is never shown again.</span></div></div>
          <div className="modal-actions"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" icon="check" disabled={status === "loading"}>{status === "loading" ? "Verifying…" : "Verify & connect"}</Button></div>
        </form>
      </>}
    </div>
  </div>;
}

function EmptyDashboard({ go }: { go: (s: Screen) => void }) {
  return <div className="page"><PageHeading title="Welcome, new student" description="Your study space is ready when you are."/><div className="first-note panel"><span className="empty-icon"><Icon name="notes"/></span><Badge tone="mint">Start here</Badge><h2>Create your first study note</h2><p>Add lecture notes, reading summaries, or key concepts. Once saved, you can instantly turn them into a practice quiz.</p><Button icon="plus" onClick={() => go("create")}>Create your first note</Button><div><span><Icon name="check" size={15}/> Keep subjects organized</span><span><Icon name="check" size={15}/> Generate AI practice questions</span></div></div></div>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [notes, setNotes] = useState(initialNotes);
  const [selected, setSelected] = useState(initialNotes[0]);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emptyUser, setEmptyUser] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const go = (next: Screen) => { setScreen(next); setMenuOpen(false); window.scrollTo({top: 0, behavior: "smooth"}); };
  const saveNote = (note: Note) => { setNotes(prev => [note, ...prev.filter(n => n.id !== note.id)]); setSelected(note); setEmptyUser(false); };
  const removeNote = () => { if (!deleteNote) return; setNotes(prev => prev.filter(n => n.id !== deleteNote.id)); setDeleteNote(null); go("notes"); };
  const requestAi = () => apiConfigured ? go("progress") : setApiModalOpen(true);
  if (screen === "users") return <UserSelection go={go} onEmpty={() => setEmptyUser(true)}/>;
  const title = ({dashboard:"Dashboard",notes:"All notes",create:"Create note",detail:"Note details",edit:"Edit note",progress:"Quiz generation",quiz:"Quiz results"} as Record<Screen,string>)[screen];
  return <div className="app-shell">
    <div className={menuOpen ? "sidebar-wrap open" : "sidebar-wrap"}><div className="drawer-backdrop" onClick={() => setMenuOpen(false)}/><Sidebar screen={screen} go={go} apiConfigured={apiConfigured} onApi={() => setApiModalOpen(true)}/></div>
    <div className="main-shell">
      <Header title={title} onMenu={() => setMenuOpen(true)} go={go} apiConfigured={apiConfigured} onApi={() => setApiModalOpen(true)}/>
      <main>
        {screen === "dashboard" && (emptyUser ? <EmptyDashboard go={go}/> : <Dashboard go={go} notes={notes} onAi={requestAi} apiConfigured={apiConfigured}/>)}
        {screen === "notes" && <NotesPage notes={notes} go={go} onDelete={setDeleteNote} onAi={requestAi} apiConfigured={apiConfigured}/>}
        {screen === "create" && <NoteForm mode="create" go={go} onSave={saveNote} existingIds={notes.map(note => note.id)}/>}
        {screen === "detail" && <NoteDetail note={selected} go={go} onDelete={setDeleteNote} onAi={requestAi} apiConfigured={apiConfigured}/>}
        {screen === "edit" && <NoteForm mode="edit" note={selected} go={go} onSave={saveNote}/>}
        {screen === "progress" && <QuizProgress go={go}/>}
        {screen === "quiz" && <QuizResults go={go} onAi={requestAi} apiConfigured={apiConfigured}/>}
      </main>
    </div>
    <MobileNav screen={screen} go={go}/>
    {deleteNote && <DeleteModal note={deleteNote} close={() => setDeleteNote(null)} confirm={removeNote}/>}
    {apiModalOpen && <ApiKeyModal configured={apiConfigured} close={() => setApiModalOpen(false)} onAccepted={() => setApiConfigured(true)} onClear={() => setApiConfigured(false)}/>}
  </div>;
}
