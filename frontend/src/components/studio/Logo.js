import { useState, useEffect, useRef } from "react";
import "./Logo.css";

/* =========================================================
   Brand logo + company name, editable from the UI.
   Saved in this browser (localStorage), shared by every screen.
   Usage:
     <Logo />                      small logo square (course.js)
     <Logo as="b" cls="" />        logo inside the slide header (Edit.js)
     <BrandName />                 company name text
     <BrandEditor onClose={...} /> the "Change logo" popup
   ========================================================= */

const KEY = "lernevo.brand";
const EVT = "lernevo-brand";
export const DEFAULT_BRAND = { img: "", name: "LERNEVO SOLUTIONS", letter: "L" };

const read = () => {
  try { return { ...DEFAULT_BRAND, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch (e) { return DEFAULT_BRAND; }
};

export function useBrand() {
  const [b, setB] = useState(read);
  useEffect(() => {
    const h = () => setB(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener("storage", h); };
  }, []);
  const save = (patch) => {
    const next = { ...read(), ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* too big: ignore */ }
    window.dispatchEvent(new Event(EVT));
  };
  return [b, save];
}

export function Logo({ as: T = "span", cls = "logo sm" }) {
  const [b] = useBrand();
  const c = `${cls}${b.img ? " has-img" : ""}`.trim();
  return <T className={c || undefined}>{b.img ? <img src={b.img} alt="" /> : b.letter}</T>;
}

export function BrandName() {
  const [b] = useBrand();
  return <>{b.name}</>;
}

// shrink the picture so it fits easily in localStorage (max 256px)
export const shrink = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onerror = rej;
  r.onload = () => {
    const im = new Image();
    im.onerror = rej;
    im.onload = () => {
      const w0 = im.naturalWidth || 256, h0 = im.naturalHeight || 256;
      const k = Math.min(1, 256 / Math.max(w0, h0));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL("image/png"));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
});

export function BrandEditor({ onClose }) {
  const [b, save] = useBrand();
  const [name, setName] = useState(b.name);
  const [letter, setLetter] = useState(b.letter);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const file = useRef(null);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const pick = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image (PNG, JPG or SVG).");
    shrink(f).then((img) => { save({ img }); setErr(""); }).catch(() => setErr("Couldn't read that image. Try another file."));
  };
  const done = () => { save({ name: name.trim() || DEFAULT_BRAND.name, letter: (letter.trim() || "L").slice(0, 2).toUpperCase() }); onClose(); };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-box" role="dialog" aria-label="Edit logo" onClick={(e) => e.stopPropagation()}>
        <div className="bm-head"><b>Edit logo</b><button type="button" className="bm-x" aria-label="Close" onClick={onClose}>×</button></div>

        <label className={`bm-drop${over ? " over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}>
          <span className={`bm-prev${b.img ? " has-img" : ""}`}>{b.img ? <img src={b.img} alt="Logo preview" /> : (letter.trim() || "L").slice(0, 2).toUpperCase()}</span>
          <span className="bm-txt">
            <b>{b.img ? "Click or drop to replace" : "Click or drop your logo here"}</b>
            <small>PNG, JPG or SVG. A square image works best.</small>
          </span>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {err && <p className="bm-err">{err}</p>}

        <label className="bm-f"><span>Company name</span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="LERNEVO SOLUTIONS" /></label>
        {!b.img && (
          <label className="bm-f"><span>Letter (shown when there is no image)</span>
            <input value={letter} maxLength={2} onChange={(e) => setLetter(e.target.value)} placeholder="L" /></label>
        )}

        <div className="bm-foot">
          <button type="button" className="bm-btn" onClick={() => { save({ ...DEFAULT_BRAND }); setName(DEFAULT_BRAND.name); setLetter(DEFAULT_BRAND.letter); }}>Reset</button>
          {b.img && <button type="button" className="bm-btn" onClick={() => save({ img: "" })}>Remove image</button>}
          <button type="button" className="bm-btn pri" onClick={done}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ---- visible upload box for the editor's Design tab ---- */
export function LogoPanel() {
  const [b, save] = useBrand();
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const pick = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image (PNG, JPG or SVG).");
    shrink(f).then((img) => { save({ img }); setErr(""); }).catch(() => setErr("Couldn't read that image."));
  };
  return (
    <div className="lp">
      <label className={`lp-drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}>
        <span className={`bm-prev${b.img ? " has-img" : ""}`}>{b.img ? <img src={b.img} alt="Logo preview" /> : b.letter}</span>
        <span className="bm-txt"><b>{b.img ? "Change logo" : "Upload your logo"}</b><small>Click or drop an image</small></span>
        <input type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {err && <p className="bm-err">{err}</p>}
      <label className="bm-f"><span>Company name</span>
        <input value={b.name} maxLength={40} onChange={(e) => save({ name: e.target.value })} /></label>
      {b.img && <button type="button" className="bm-btn" onClick={() => save({ img: "" })}>Remove logo</button>}
    </div>
  );
}

/* ---- logo + name on a slide in the editor: click it to upload a new logo ---- */
export function EditableBrand() {
  const [, save] = useBrand();
  const f = useRef(null);
  return (
    <span className="bm-click" role="button" tabIndex={0} title="Click to change the logo" onClick={() => f.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f.current?.click(); } }}>
      <Logo as="b" cls="" /> <BrandName />
      <input ref={f} type="file" accept="image/*" hidden onChange={(e) => { const x = e.target.files?.[0]; e.target.value = ""; if (x && x.type.startsWith("image/")) shrink(x).then((img) => save({ img })).catch(() => {}); }} />
    </span>
  );
}