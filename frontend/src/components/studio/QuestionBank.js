import React, { useMemo, useState } from "react";
import { ArrowRight, Plus, Search, Trash2, X } from "lucide-react";
import "./QuestionBank.css";

const TYPES = ["Multiple Choice", "Multiple Answer", "True / False", "Short Answer", "Drag & Drop Order", "Matching Pairs"];
const SEED = [
  { id: "q1", type: TYPES[0], marks: "0.5", category: "DATA PROTECTION", question: "Which of these is sensitive personal data?", options: ["A medical certificate", "A generic job description", "An office floor plan", "A public price list"], correct: [0] },
  { id: "q2", type: TYPES[1], marks: "2", category: "DATA PROTECTION", question: "Select every valid lawful basis.", options: ["Consent", "Contract", "Convenience", "Legal obligation"], correct: [0, 1, 3] },
  { id: "q3", type: TYPES[2], marks: "1", category: "DATA PROTECTION", question: "It is fine to use personal email for work documents if the file is small.", options: ["True", "False"], correct: [1] },
  { id: "q4", type: TYPES[3], marks: "2", category: "DATA PROTECTION", question: "What should you do first when you suspect a data breach?", answer: "Report it to the Data Protection team" },
  { id: "q5", type: TYPES[4], marks: "3", category: "DATA PROTECTION", question: "Put the breach response steps in the right order.", options: ["Report to the Data Protection team", "Contain the incident", "Assessment and notification decision", "Record what happened"], correct: [0, 1, 2, 3] },
  { id: "q6", type: TYPES[5], marks: "3", category: "DATA PROTECTION", question: "Match each term to its meaning.", pairs: [["Data minimisation", "Collect only what you need"], ["Storage limitation", "Delete when no longer needed"], ["Accuracy", "Keep records correct"]] },
];
const readQuestions = () => { try { const saved = localStorage.getItem("lernevo-question-bank"); return saved ? JSON.parse(saved) : SEED; } catch { return SEED; } };
const COURSE_STORAGE_KEY = "content-studio-courses";
const FALLBACK_COURSES = [
  { id: 1, title: "Data Protection Essentials" },
  { id: 2, title: "Product Knowledge: The Lernevo Pulse Suite" },
  { id: 4, title: "Phishing Awareness: Spot the Fake" },
  { id: 3, title: "New Joiner Onboarding" },
];
const readCourses = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : FALLBACK_COURSES;
  } catch { return FALLBACK_COURSES; }
};

function QuestionForm({ initial, onClose, onSave }) {
  const [type, setType] = useState(initial?.type || TYPES[0]);
  const [question, setQuestion] = useState(initial?.question || "");
  const [marks, setMarks] = useState(initial?.marks || "1");
  const [category, setCategory] = useState(initial?.category || "DATA PROTECTION");
  const [options, setOptions] = useState(initial?.options || ["", "", "", ""]);
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [correct, setCorrect] = useState(initial?.correct || []);
  const [pairs, setPairs] = useState(initial?.pairs || [["", ""], ["", ""], ["", ""]]);
  const [description, setDescription] = useState(initial?.description || "");
  const [explanation, setExplanation] = useState(initial?.explanation || "");
  const [correctBranch, setCorrectBranch] = useState(initial?.branching?.correct || "Continue to next slide");
  const [incorrectBranch, setIncorrectBranch] = useState(initial?.branching?.incorrect || "Continue to next slide");
  const [mandatory, setMandatory] = useState(initial?.mandatory ?? true);
  const [formError, setFormError] = useState("");
  const [draggedOption, setDraggedOption] = useState(null);
  const changeOption = (i, value) => setOptions((old) => old.map((item, index) => index === i ? value : item));
  const toggleCorrect = (i, checked) => {
    setFormError("");
    setCorrect((old) => type !== "Multiple Answer" ? (checked ? [i] : []) : checked ? [...old, i] : old.filter((n) => n !== i));
  };
  const deleteOption = (i) => {
    setOptions((old) => old.filter((_, index) => index !== i));
    setCorrect((old) => old.filter((index) => index !== i).map((index) => index > i ? index - 1 : index));
  };
  const reorderOption = (from, to) => setOptions((old) => {
    if (from === to || from < 0 || to < 0 || from >= old.length || to >= old.length) return old;
    const updated = [...old];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    return updated;
  });
  const changeType = (nextType) => {
    setFormError("");
    if (nextType === "True / False") {
      setOptions(["True", "False"]);
      if (type !== "True / False") setCorrect([]);
    } else if (type === "True / False") {
      setCorrect([]);
    }
    if (nextType === "Short Answer" && type !== "Short Answer") {
      const selectedText = options.filter((_, index) => correct.includes(index)).join(", ");
      if (selectedText) setAnswer(selectedText);
    }
    if (nextType === "Multiple Choice" && type === "Multiple Answer") setCorrect((old) => old.slice(0, 1));
    if (nextType === "Multiple Answer" && type === "Multiple Choice") setCorrect((old) => old.slice(0, 1));
    setType(nextType);
  };
  const submit = (event) => {
    event.preventDefault();
    const cleanOptions = options.map((item) => item.trim()).filter(Boolean);
    const cleanPairs = pairs.map(([left, right]) => [left.trim(), right.trim()]).filter(([left, right]) => left && right);
    const savedOptions = type === "Short Answer" || type === "Matching Pairs" ? undefined : cleanOptions;
    const savedCorrect = type === "Drag & Drop Order" ? cleanOptions.map((_, i) => i) : correct.map((index) => options.slice(0, index + 1).filter((option) => option.trim()).length - 1).filter((index) => index >= 0 && index < cleanOptions.length);
    if (["Multiple Choice", "Multiple Answer", "True / False"].includes(type) && savedCorrect.length === 0) {
      setFormError("Select at least one correct answer before saving.");
      return;
    }
    if (type === "Drag & Drop Order" && cleanOptions.length === 0) {
      setFormError("Add at least one item to set the order.");
      return;
    }
    if (type === "Matching Pairs" && cleanPairs.length === 0) {
      setFormError("Add at least one complete matching pair before saving.");
      return;
    }
    setFormError("");
    onSave({ ...(initial || {}), id: initial?.id || `q-${Date.now()}`, type, question: question.trim(), marks, category: category.trim().toUpperCase(), description: description.trim(), explanation: explanation.trim(), branching: { correct: correctBranch, incorrect: incorrectBranch }, mandatory, ...(type === "Short Answer" ? { answer } : type === "Matching Pairs" ? { pairs: cleanPairs } : { options: savedOptions, correct: type === "Drag & Drop Order" ? cleanOptions.map((_, i) => i) : savedCorrect }) });
  };
  const branches = ["Continue to next slide", "Go to previous slide", "End course"];
  return <form className="qb-modal qb-edit-modal" role="dialog" aria-modal="true" aria-labelledby="qb-edit-modal-title" onSubmit={submit}>
    <header className="qb-modal-header"><h2 id="qb-edit-modal-title">{initial ? "Edit bank question" : "New question"}</h2><button className="qb-icon" type="button" aria-label="Close" onClick={onClose}><X size={19}/></button></header>
    <div className="qb-edit-body">
      <section className="qb-edit-section"><h3>Question</h3><div className="qb-edit-type-row"><label>Question type<select value={type} onChange={(e) => changeType(e.target.value)}>{TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Marks<input type="number" min="0" step="0.5" value={marks} onChange={(e) => setMarks(e.target.value)} /></label></div><label>Question title<textarea required value={question} onChange={(e) => setQuestion(e.target.value)} rows="2" /></label><label>Description (optional)<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A helpful hint for the learner" /></label><label>Category<input value={category} onChange={(e) => setCategory(e.target.value)} /></label></section>
      {type !== "Short Answer" && <section className="qb-edit-section">
        <h3>{type === "True / False" ? "True or False" : type === "Matching Pairs" ? "Matching pairs" : type === "Drag & Drop Order" ? "Items to order" : "Answer options"}</h3>
        <p className="qb-edit-help">{type === "Multiple Choice" ? "Click the circle to mark the correct answer." : type === "Multiple Answer" ? "Select every correct answer." : type === "Drag & Drop Order" ? "List the items in the correct order — learners drag them into place." : type === "Matching Pairs" ? "Learners match each left item to the right one." : "Choose whether the statement is true or false."}</p>
        {type === "Matching Pairs" ? <div className="qb-edit-options">{pairs.map(([left, right], i) => <div className="qb-option-edit qb-pair-edit" key={i}>
          <input aria-label={`Term ${i + 1}`} value={left} onChange={(e) => setPairs((old) => old.map((pair, index) => index === i ? [e.target.value, pair[1]] : pair))} placeholder="Term" />
          <input aria-label={`Meaning ${i + 1}`} value={right} onChange={(e) => setPairs((old) => old.map((pair, index) => index === i ? [pair[0], e.target.value] : pair))} placeholder="Meaning" />
          <button className="qb-delete" type="button" aria-label={`Delete pair ${i + 1}`} onClick={() => setPairs((old) => old.filter((_, index) => index !== i))}><Trash2 size={16}/></button>
        </div>)}</div> : type === "Drag & Drop Order" ? <div className="qb-edit-options qb-order-list-edit">{options.map((item, i) => <div className={`qb-order-edit-row ${draggedOption === i ? "is-dragging" : ""}`} key={`${i}-${item}`} draggable onDragStart={() => setDraggedOption(i)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedOption !== null) reorderOption(draggedOption, i); setDraggedOption(null); }} onDragEnd={() => setDraggedOption(null)}>
          <span className="qb-order-number">{i + 1}</span>
          <input aria-label={`Ordered item ${i + 1}`} value={item} onChange={(e) => changeOption(i, e.target.value)} placeholder={`Item ${i + 1}`} />
          <button className="qb-delete" type="button" aria-label={`Delete item ${i + 1}`} onClick={() => deleteOption(i)}><Trash2 size={16}/></button>
        </div>)}</div> : <div className={`qb-edit-options ${type === "True / False" ? "qb-true-false-options" : ""}`}>{options.map((item, i) => <div className="qb-option-edit" key={i}>
          <input aria-label={`Correct answer ${i + 1}`} type={type === "Multiple Answer" ? "checkbox" : "radio"} name="correct" checked={correct.includes(i)} onChange={(e) => toggleCorrect(i, e.target.checked)} />
          {type === "True / False" ? <span className="qb-tf-label">{item}</span> : <input value={item} onChange={(e) => changeOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />}
          {type !== "True / False" && <button className="qb-delete" type="button" aria-label={`Delete option ${i + 1}`} onClick={() => deleteOption(i)}><Trash2 size={16}/></button>}
        </div>)}</div>}
        {type !== "True / False" && <button className="qb-add-option" type="button" onClick={() => type === "Matching Pairs" ? setPairs((old) => [...old, ["", ""]]) : setOptions((old) => [...old, ""])}><Plus size={16}/>{type === "Matching Pairs" ? "Add pair" : type === "Drag & Drop Order" ? "Add item" : "Add option"}</button>}
        {formError && <p className="qb-form-error" role="alert">{formError}</p>}
      </section>}
      {type === "Short Answer" && <section className="qb-edit-section"><h3>Expected answer</h3><label>Accepted answer<input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter the expected answer" /></label></section>}
      <section className="qb-edit-section"><h3>Explanation</h3><p className="qb-edit-help">Shown in the answer review after the quiz.</p><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows="3" /></section>
      <section className="qb-edit-section"><h3>Branching (optional)</h3><p className="qb-edit-help">Send learners to a different slide based on their answer.</p><div className="qb-edit-type-row"><label>If correct, go to<select value={correctBranch} onChange={(e) => setCorrectBranch(e.target.value)}>{branches.map((item) => <option key={item}>{item}</option>)}</select></label><label>If incorrect, go to<select value={incorrectBranch} onChange={(e) => setIncorrectBranch(e.target.value)}>{branches.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="qb-mandatory"><span><strong>Mandatory answer</strong><small>Learner cannot continue without answering.</small></span><input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} /></label></section>
    </div>
    <footer className="qb-modal-footer"><button className="qb-secondary" type="button" onClick={onClose}>Cancel</button><button className="qb-primary" type="submit">Save question</button></footer>
  </form>;
}

function QuestionContent({ item }) {
  if (item.type === "Short Answer") return <div className="qb-answer-placeholder"><i /> <span>{item.answer || "Expected answer"}</span></div>;
  if (item.type === "Matching Pairs") return <ul className="qb-content-list">{(item.pairs || []).map(([left, right]) => <li key={left}><i className="qb-dot" />{left} <span className="qb-match-arrow">→</span> {right}</li>)}</ul>;
  return <ul className={`qb-content-list ${item.type === "Drag & Drop Order" ? "qb-order-list" : ""}`}>{(item.options || []).map((option, i) => <li key={`${option}-${i}`}><i className={`qb-dot ${item.correct?.includes(i) ? "is-correct" : ""}`} />{option}</li>)}</ul>;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState(readQuestions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All types");
  const [editing, setEditing] = useState(null);
  const [addToCourse, setAddToCourse] = useState(null);
  const [courses, setCourses] = useState(readCourses);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [notice, setNotice] = useState("");
  const save = (next) => {
    const updated = editing ? questions.map((q) => q.id === next.id ? next : q) : [...questions, next];
    setQuestions(updated);
    try {
      localStorage.setItem("lernevo-question-bank", JSON.stringify(updated));
      if (editing) {
        const storedCourses = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || "null");
        if (Array.isArray(storedCourses)) {
          const updatedCourses = storedCourses.map((course) => ({ ...course, bankQuestions: (course.bankQuestions || []).map((question) => question.id === next.id ? { ...question, ...next } : question) }));
          localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(updatedCourses));
          setCourses(updatedCourses);
        }
      }
    } catch { /* Keep the edited question available for this session if storage is unavailable. */ }
    setEditing(null);
  };
  const filtered = useMemo(() => questions.filter((item) => (filter === "All types" || item.type === filter) && `${item.question} ${item.category} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [questions, filter, query]);
  const remove = (item) => { if (!window.confirm("Delete this question from your bank?")) return; const updated = questions.filter((q) => q.id !== item.id); setQuestions(updated); localStorage.setItem("lernevo-question-bank", JSON.stringify(updated)); };
  const openCourseModal = (item) => {
    const availableCourses = readCourses();
    setCourses(availableCourses);
    setSelectedCourseId(String(availableCourses[0]?.id ?? ""));
    setAddToCourse(item);
  };
  const add = (event) => {
    event.preventDefault();
    if (!addToCourse) return;
    const selectedCourse = courses.find((course) => String(course.id) === selectedCourseId);
    if (!selectedCourse) return;
    const courseBank = Array.isArray(selectedCourse.bankQuestions) ? selectedCourse.bankQuestions : [];
    const alreadyAdded = courseBank.some((item) => item.id === addToCourse.id);
    const updatedCourse = { ...selectedCourse, bankQuestions: alreadyAdded ? courseBank : [...courseBank, { ...addToCourse }] };
    const updatedCourses = courses.map((course) => String(course.id) === selectedCourseId ? updatedCourse : course);
    const updatedQuestion = { ...addToCourse, courseIds: [...new Set([...(addToCourse.courseIds || []).map(String), selectedCourseId])] };
    const updatedQuestions = questions.map((item) => item.id === addToCourse.id ? updatedQuestion : item);
    setCourses(updatedCourses);
    setQuestions(updatedQuestions);
    try {
      localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(updatedCourses));
      localStorage.setItem("lernevo-question-bank", JSON.stringify(updatedQuestions));
    } catch { /* Keep the association for this session when browser storage is unavailable. */ }
    setAddToCourse(null);
    setNotice(alreadyAdded ? `This question is already in ${selectedCourse.title || selectedCourse.name}.` : `Added to ${selectedCourse.title || selectedCourse.name}.`);
    window.setTimeout(() => setNotice(""), 2600);
  };
  return <main className="qb-page">
    <div className="qb-header"><div><h1>Question bank</h1><p>{questions.length} reusable questions · save once, use across every course.</p></div><button className="qb-primary qb-new" onClick={() => setEditing(false)}><Plus size={19}/>New question</button></div>
    <div className="qb-toolbar"><label className="qb-search"><Search size={19}/><input aria-label="Search questions" placeholder="Search questions..." value={query} onChange={(e) => setQuery(e.target.value)} />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16}/></button>}</label><div className="qb-filters" role="tablist" aria-label="Filter by question type"><button role="tab" aria-selected={filter === "All types"} className={filter === "All types" ? "is-selected" : ""} onClick={() => setFilter("All types")}>All types</button>{TYPES.map((type) => <button role="tab" aria-selected={filter === type} className={filter === type ? "is-selected" : ""} key={type} onClick={() => setFilter(type)}>{type}</button>)}</div></div>
    {filtered.length ? <div className="qb-grid">{filtered.map((item) => <article className="qb-card" key={item.id}><div className="qb-meta"><span className="qb-type">{item.type}</span><span className="qb-marks">{item.marks} {Number(item.marks) === 1 ? "mark" : "marks"}</span><span className="qb-category">{item.category}</span><button className="qb-delete" aria-label={`Delete: ${item.question}`} onClick={() => remove(item)}><Trash2 size={16}/></button></div><h2>{item.question}</h2><QuestionContent item={item}/><div className="qb-actions"><button className="qb-primary qb-add" onClick={() => openCourseModal(item)}>Add to course <ArrowRight size={19}/></button><button className="qb-secondary" onClick={() => setEditing(item)}>Edit</button></div></article>)}</div> : <div className="qb-empty"><Search size={23}/><strong>No questions found</strong><span>Try another search or question type.</span></div>}
    <p className="qb-note">Questions live in this browser. In the editor you can also save any course question straight to the bank.</p>
    {notice && <div className="qb-notice" role="status">{notice}</div>}
    {editing !== null && <div className="qb-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}><QuestionForm key={editing?.id || "new-question"} initial={editing || null} onClose={() => setEditing(null)} onSave={save}/></div>}
    {addToCourse && <div className="qb-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAddToCourse(null)}><form className="qb-modal qb-course-modal" role="dialog" aria-modal="true" aria-labelledby="qb-course-modal-title" onSubmit={add}><header className="qb-modal-header"><h2 id="qb-course-modal-title">Add to a course</h2><button className="qb-icon" type="button" aria-label="Close" onClick={() => setAddToCourse(null)}><X size={19}/></button></header><p className="qb-selected-question">{addToCourse.question}</p><label className="qb-course-label">Course<select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} required>{courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title || course.name}</option>)}</select></label><footer className="qb-modal-footer"><button className="qb-secondary" type="button" onClick={() => setAddToCourse(null)}>Cancel</button><button className="qb-primary" type="submit">Add to course <ArrowRight size={17}/></button></footer></form></div>}
  </main>;
}
