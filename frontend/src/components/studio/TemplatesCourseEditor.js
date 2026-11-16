import { useEffect, useMemo, useState } from "react";
import TemplatesCourseEdit from "./TemplatesCourseEdit";
import Preview from "./Preview";

const TEMPLATE_LAYOUTS = {
  welcome: "welcome", overview: "overview", objectives: "objectives", profile: "content", info: "overview",
  text: "text", image: "content", video: "video", points: "points", columns: "twocol", pdf: "content",
  single: "mcq", multiple: "multi", truefalse: "tf", matching: "multi", short: "short",
  passed: "result", failed: "result", score: "result", thanks: "thanks", summary: "takeaways",
};

function toEditorSlide(source) {
  const content = source.content || {};
  const settings = source.settings || {};
  const layout = TEMPLATE_LAYOUTS[source.layoutType] || "text";
  const bullets = content.bullets || [];
  const items = bullets.length ? [...bullets] : content.duration || content.audience
    ? [content.duration, content.audience].filter(Boolean)
    : [...(content.options || [])];

  return {
    id: source.id,
    templateId: source.templateId,
    layout,
    sec: source.section,
    title: content.heading || source.name,
    body: content.bodyText || content.description || source.description || "",
    items,
    points: bullets.length ? bullets.map((item) => [item, ""]) : [["Recognise", "the important details"], ["Apply", "what you have learned"]],
    cols: layout === "twocol" ? [
      [content.leftHeading || "Option one", content.leftBody || ""],
      [content.rightHeading || "Option two", content.rightBody || ""],
    ] : undefined,
    q: content.heading || source.name,
    options: content.options || ["Option A", "Option B", "Option C"],
    answer: content.correctAnswer ?? 0,
    answers: content.correctAnswers || [content.correctAnswer ?? 0],
    explain: content.explanation || "",
    img: content.imageUrl || "",
    video: content.videoUrl || "",
    poster: "",
    bg: settings.background || "#ffffff",
    fg: settings.textColor || "#0f172a",
    font: settings.fontFamily || "Inter, system-ui, sans-serif",
    k: Math.max(0.7, Math.min(1.5, Number(settings.fontSize || 28) / 28)),
    align: settings.alignment || "left",
    flip: settings.imagePosition === "left" || settings.layout === "Split",
    notes: settings.notes || "",
    ownBrand: true,
    delay: Number(settings.nextDelaySeconds || 0),
    duration: Number(settings.duration || 0),
    mandatory: Boolean(settings.mandatory),
    nav: settings.navigation !== false,
  };
}

function readSlideList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    const slides = Array.isArray(value) ? value : value?.slides;
    return Array.isArray(slides) ? slides : [];
  } catch {
    return [];
  }
}

export default function TemplatesCourseEditor({ course, selectedSlide, onBack }) {
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const editorCourse = useMemo(() => ({ ...course, id: `template-${course.id}` }), [course]);
  const storageKey = `lernevo.edit.${editorCourse.id}`;
  const initialTemplateSlides = useMemo(() => {
    const seen = new Set();
    return (course.templateSlides || []).filter((slide) => {
      const key = slide.templateId || slide.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(toEditorSlide);
  }, [course.templateSlides]);

  useEffect(() => {
    const savedEditorSlides = readSlideList(storageKey);
    const courseEditorSlides = readSlideList(`lernevo.edit.${course.id}`);
    const combined = [...(savedEditorSlides.length ? savedEditorSlides : courseEditorSlides)];
    const ids = new Set(combined.map((slide) => slide.id));
    const templateIds = new Set(combined.map((slide) => slide.templateId).filter(Boolean));
    initialTemplateSlides.forEach((slide) => {
      if (!ids.has(slide.id) && (!slide.templateId || !templateIds.has(slide.templateId))) {
        combined.push(slide);
        ids.add(slide.id);
        if (slide.templateId) templateIds.add(slide.templateId);
      }
    });
    try { localStorage.setItem(storageKey, JSON.stringify(combined)); } catch { /* Keep this editor session available. */ }
    setReady(true);
  }, [course.id, initialTemplateSlides, storageKey]);

  if (!ready) return <div className="pe" aria-busy="true" />;
  if (preview) return <Preview course={editorCourse} onExit={() => setPreview(false)} onClose={() => setPreview(false)} />;
  return <TemplatesCourseEdit course={editorCourse} initialSlides={initialTemplateSlides} initialSelectedSlideId={selectedSlide?.id} onBack={onBack} onPreview={() => setPreview(true)} />;
}
