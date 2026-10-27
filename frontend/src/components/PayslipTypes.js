import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, Coins, FileText, Layers, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import "./PayslipTypes.css";

const makeItem = (id, name, type = "fixed", amount = 0, extra = {}) => ({ id, name, type, amount, percent: 0, baseId: "basic", quantity: 1, rate: 0, ...extra });
const makeConfig = (id, title, description, icon, earnings, deductions, example) => ({ id, title, description, icon, earnings, deductions, example });
const templateDefaults = [
  makeConfig("fixed", "Fixed Pay", "A structured monthly salary with configurable allowances.", BriefcaseBusiness, [makeItem("basic", "Basic Salary", "fixed", 30000), makeItem("hra", "House Rent Allowance (HRA)", "percent", 0, { percent: 40 }), makeItem("conveyance", "Conveyance Allowance", "fixed", 3200), makeItem("special", "Special Allowance", "fixed", 5000), makeItem("other", "Other Allowance", "fixed", 2000)], [makeItem("pf", "Employee PF", "percent", 0, { percent: 12 }), makeItem("pt", "Professional Tax", "fixed", 200), makeItem("tds", "Income Tax (TDS)", "fixed", 2500), makeItem("other-deduction", "Other Deduction", "fixed", 500)], "Monthly salary components"),
  makeConfig("monthly", "Monthly Pay", "Monthly base pay with recurring allowances and deductions.", CalendarDays, [makeItem("basic", "Monthly Basic Salary", "fixed", 36000), makeItem("allowance", "Monthly Allowances", "fixed", 6500), makeItem("bonus", "Monthly Incentive", "fixed", 1500)], [makeItem("pf", "Employee PF", "percent", 0, { percent: 12 }), makeItem("pt", "Professional Tax", "fixed", 200)], "Monthly amount as entered"),
  makeConfig("hourly", "Hourly Pay", "Pay based on approved regular and overtime hours.", Clock3, [makeItem("regular", "Regular Pay", "quantity", 0, { quantity: 160, rate: 250 }), makeItem("overtime", "Overtime Pay", "quantity", 0, { quantity: 8, rate: 375 }), makeItem("other", "Other Earnings", "fixed", 1200)], [makeItem("pf", "Employee PF", "percent", 0, { percent: 12, baseId: "regular" }), makeItem("tax", "Professional Tax", "fixed", 200)], "Approved hours × applicable rate"),
  makeConfig("daily", "Daily Wage", "Daily rate multiplied by payable days, plus eligible allowances.", CalendarDays, [makeItem("wages", "Gross Wages", "quantity", 0, { quantity: 22, rate: 1600 }), makeItem("allowance", "Meal Allowance", "fixed", 1200)], [makeItem("tax", "Professional Tax", "fixed", 200), makeItem("advance", "Wage Advance", "fixed", 1000)], "Daily wage rate × payable days"),
  makeConfig("weekly", "Weekly Pay", "Weekly base pay and allowances for the selected pay period.", CalendarDays, [makeItem("basic", "Weekly Basic Pay", "fixed", 12000), makeItem("allowance", "Weekly Allowances", "fixed", 1500)], [makeItem("deduction", "Weekly Deductions", "fixed", 650)], "Weekly pay components"),
  makeConfig("project", "Project Based", "Approved project and milestone payments with applicable deductions.", Layers, [makeItem("project", "Project Payment", "fixed", 42000), makeItem("milestone", "Milestone Payment", "fixed", 10000), makeItem("additional", "Approved Additional Payment", "fixed", 2500)], [makeItem("withholding", "Project Withholding", "percent", 0, { percent: 5, baseId: "project" }), makeItem("advance", "Payment Advance", "fixed", 2000)], "Approved project payments"),
  makeConfig("commission", "Commission Based", "Commission calculated from eligible sales, with optional base pay.", Coins, [makeItem("basic", "Base Salary", "fixed", 18000), makeItem("commission", "Sales Commission", "percent", 0, { percent: 5, baseId: "", baseName: "Eligible Sales", baseValue: 200000 }), makeItem("bonus", "Additional Earnings", "fixed", 2500)], [makeItem("pf", "Employee PF", "percent", 0, { percent: 12, baseId: "basic" }), makeItem("tax", "Professional Tax", "fixed", 200)], "Eligible sales × commission rate"),
  makeConfig("internship", "Internship", "Monthly stipend with payable day adjustments and approved allowances.", BriefcaseBusiness, [makeItem("stipend", "Monthly Stipend", "quantity", 0, { quantity: 20, rate: 900 }), makeItem("allowance", "Intern Allowance", "fixed", 1000)], [makeItem("advance", "Stipend Advance", "fixed", 1000)], "Payable days × daily stipend"),
  makeConfig("custom", "Custom Template", "Build a configurable template from fixed, percentage, or quantity based components.", FileText, [makeItem("basic", "Custom Earning", "fixed", 30000), makeItem("allowance", "Additional Earning", "fixed", 3000)], [makeItem("deduction", "Custom Deduction", "fixed", 500)], "User configured calculation rules"),
];

const currency = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
const clone = (value) => {
  const copy = JSON.parse(JSON.stringify(value));
  // Lucide icons are React component objects; JSON cloning strips their render method.
  if (value && value.icon) copy.icon = value.icon;
  return copy;
};
const evaluate = (item, allItems) => {
  if (item.type === "percent") {
    const base = allItems.find((candidate) => candidate.id === item.baseId);
    const baseAmount = base ? evaluate(base, allItems) : Number(item.baseValue || 0);
    return (baseAmount * Number(item.percent || 0)) / 100;
  }
  if (item.type === "quantity") return Number(item.quantity || 0) * Number(item.rate || 0);
  return Number(item.amount || 0);
};
const logicLabel = (item, allItems) => {
  if (item.type === "percent") return `${item.percent}% of ${allItems.find((candidate) => candidate.id === item.baseId)?.name || item.baseName || "selected base"}`;
  if (item.type === "quantity") return "Quantity × rate";
  return "Fixed amount as entered";
};
const exampleLabel = (item, allItems) => {
  if (item.type === "percent") return `${currency(allItems.find((candidate) => candidate.id === item.baseId) ? evaluate(allItems.find((candidate) => candidate.id === item.baseId), allItems) : item.baseValue)} × ${item.percent}%`;
  if (item.type === "quantity") return `${Number(item.quantity || 0)} × ${currency(item.rate)}`;
  return currency(item.amount);
};

export default function PayslipTypes({ onBack, onNotice }) {
  const [configs, setConfigs] = useState(() => Object.fromEntries(templateDefaults.map((config) => [config.id, clone(config)])));
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("preview");
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [rowDraft, setRowDraft] = useState(null);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const active = activeId ? configs[activeId] : null;
  const totals = useMemo(() => {
    if (!draft) return { earnings: 0, deductions: 0, net: 0 };
    const earnings = draft.earnings.reduce((sum, item) => sum + evaluate(item, draft.earnings), 0);
    const deductions = draft.deductions.reduce((sum, item) => sum + evaluate(item, draft.earnings), 0);
    return { earnings, deductions, net: earnings - deductions };
  }, [draft]);
  useEffect(() => {
    if (!activeId) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (dirty && !window.confirm("Discard your unsaved template edits?")) return;
      setActiveId(null); setDraft(null); setEditing(null); setRowDraft(null); setError(""); setDirty(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, dirty]);

  const openTemplate = (id) => { setActiveId(id); setDraft(clone(configs[id])); setTab("preview"); setEditing(null); setError(""); setDirty(false); };
  const closeTemplate = (discard = false) => {
    if (dirty && !discard && !window.confirm("Discard your unsaved template edits?")) return;
    setActiveId(null); setDraft(null); setEditing(null); setRowDraft(null); setError(""); setDirty(false);
  };
  const startEdit = (section, item) => { setEditing(`${section}:${item.id}`); setRowDraft(clone(item)); setError(""); };
  const saveRow = (section) => {
    const item = rowDraft;
    if (!item.name.trim()) return setError("Enter a component name.");
    if (item.type === "percent" && (item.percent === "" || !Number.isFinite(Number(item.percent)) || Number(item.percent) < 0 || Number(item.percent) > 100)) return setError("Enter a percentage from 0 to 100.");
    if (item.type === "percent" && !item.baseId && (item.baseValue === "" || !Number.isFinite(Number(item.baseValue)) || Number(item.baseValue) < 0)) return setError("Enter a valid non-negative base amount.");
    if (item.type === "quantity" && (![item.quantity, item.rate].every((value) => value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0))) return setError("Quantity and rate must be valid non-negative numbers.");
    if (item.type === "fixed" && (item.amount === "" || !Number.isFinite(Number(item.amount)) || Number(item.amount) < 0)) return setError("Enter a valid non-negative amount.");
    if (item.type === "percent" && item.baseId === item.id) return setError("A component cannot use itself as its calculation base.");
    if (section === "earnings") {
      const candidateRows = draft.earnings.map((row) => row.id === item.id ? item : row);
      const candidateById = Object.fromEntries(candidateRows.map((row) => [row.id, row]));
      const cycles = (id, path = new Set()) => { const row = candidateById[id]; if (!row || row.type !== "percent" || !row.baseId) return false; if (path.has(row.baseId)) return true; const next = new Set(path); next.add(id); return cycles(row.baseId, next); };
      if (candidateRows.some((row) => cycles(row.id))) return setError("This rule would create a circular calculation. Choose a different base.");
    }
    setDraft((current) => ({ ...current, [section]: current[section].map((row) => row.id === item.id ? { ...item, name: item.name.trim() } : row) }));
    setEditing(null); setRowDraft(null); setError(""); setDirty(true);
  };
  const addRow = (section) => {
    const id = `${section}-${Date.now()}`;
    setDraft((current) => ({ ...current, [section]: [...current[section], makeItem(id, section === "earnings" ? "New Earning" : "New Deduction")] }));
    setEditing(`${section}:${id}`); setRowDraft(makeItem(id, section === "earnings" ? "New Earning" : "New Deduction")); setDirty(true);
  };
  const removeRow = (section, item) => {
    if (section === "earnings" && draft.earnings.some((row) => row.type === "percent" && row.baseId === item.id)) { setError(`Another component uses ${item.name} as its calculation base. Update that rule before removing this component.`); return; }
    if (!window.confirm(`Remove ${item.name} from this template?`)) return;
    setDraft((current) => ({ ...current, [section]: current[section].filter((row) => row.id !== item.id) })); setDirty(true);
  };
  const saveTemplate = () => {
    const all = [...draft.earnings, ...draft.deductions];
    const invalidReference = all.find((item) => item.type === "percent" && item.baseId && !draft.earnings.some((earning) => earning.id === item.baseId));
    if (invalidReference) { setError(`${invalidReference.name} refers to a missing earning component.`); return; }
    const earningsById = Object.fromEntries(draft.earnings.map((item) => [item.id, item]));
    const hasCycle = (id, seen = new Set()) => { const item = earningsById[id]; if (!item || item.type !== "percent" || !item.baseId) return false; if (seen.has(id) || seen.has(item.baseId)) return true; const next = new Set(seen); next.add(id); return hasCycle(item.baseId, next); };
    if (draft.earnings.some((item) => hasCycle(item.id))) { setError("Calculation rules cannot refer to each other in a circular loop."); return; }
    setConfigs((current) => ({ ...current, [draft.id]: clone(draft) })); setDirty(false); setError("");
    onNotice(`${draft.title} was saved for this session. Template changes are not connected to database persistence.`);
  };

  return <section className="pt-page" aria-label="Payslip types">
    <div className="pt-page-top"><button className="pt-back" onClick={onBack}><ArrowLeft size={16}/>Back to Payslips</button><span className="pt-session-note">Template configuration · changes are session only</span></div>
    <div className="pt-title"><span className="pay-eyebrow">HR OPERATIONS</span><h2>Payslip Types</h2><p>Manage payslip templates for different payment structures.</p></div>
    <div className="pt-grid">{templateDefaults.map((item) => {
      const Icon = item.icon; const config = configs[item.id]; const count = config.earnings.length + config.deductions.length;
      return <article key={item.id} className="pt-card" tabIndex="0" aria-label={`Open ${config.title} template`} onClick={() => openTemplate(item.id)} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openTemplate(item.id); } }}><span className="pt-card-icon"><Icon size={19}/></span><h3>{config.title}</h3><p>{config.description}</p><span className="pt-components">{count} components</span><button className="pt-view" onClick={(event) => { event.stopPropagation(); openTemplate(item.id); }}>View Template</button></article>;
    })}</div>

    {active && draft && <div className="pt-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTemplate(); }}><section className="pt-modal" role="dialog" aria-modal="true" aria-labelledby="pt-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="pt-modal-head"><div className="pt-modal-identity"><span className="pt-card-icon"><active.icon size={20}/></span><div><h2 id="pt-modal-title">{draft.title}</h2><p>{draft.description}</p></div></div><button className="pt-close" aria-label="Close template" onClick={() => closeTemplate()}><X size={19}/></button></header>
      <div className="pt-tabs" role="tablist" aria-label="Template information"><button role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? "is-active" : ""} onClick={() => setTab("preview")}>Template Preview</button><button role="tab" aria-selected={tab === "details"} className={tab === "details" ? "is-active" : ""} onClick={() => setTab("details")}>Calculation Details</button></div>
      <div className="pt-modal-content">
        {tab === "preview" ? <>
          <div className="pt-sample-banner"><FileText size={15}/><span>Illustrative sample data · not an employee payroll record</span></div>
          <div className="pt-employee"><strong>Sample employee</strong><div><span>Employee Name<b>John Doe</b></span><span>Employee ID<b>EMP001</b></span><span>Department<b>Engineering</b></span><span>Designation<b>Software Developer</b></span><span>Pay Period<b>October 2026</b></span></div></div>
          <div className="pt-ledger-grid"><Ledger title="Earnings" tone="earning" items={draft.earnings} allEarnings={draft.earnings} editing={editing} rowDraft={rowDraft} error={error} setRowDraft={setRowDraft} startEdit={startEdit} saveRow={saveRow} cancelEdit={() => { setEditing(null); setRowDraft(null); setError(""); }} removeRow={removeRow} onAdd={() => addRow("earnings")}/><Ledger title="Deductions" tone="deduction" items={draft.deductions} allEarnings={draft.earnings} editing={editing} rowDraft={rowDraft} error={error} setRowDraft={setRowDraft} startEdit={startEdit} saveRow={saveRow} cancelEdit={() => { setEditing(null); setRowDraft(null); setError(""); }} removeRow={removeRow} onAdd={() => addRow("deductions")}/></div>
          <div className="pt-net"><span><small>NET PAY</small><strong>{currency(totals.net)}</strong></span><p>{currency(totals.earnings)} total earnings − {currency(totals.deductions)} total deductions</p></div>
          <p className="pt-illustrative">All amounts and calculations shown are illustrative sample values.</p>
        </> : <>
          <div className="pt-detail-intro"><strong>How this template calculates payroll</strong><span>Values below update as you edit the sample components.</span></div>
          <CalculationTable title="Earnings calculation" tone="earning" items={draft.earnings} allEarnings={draft.earnings} onEdit={(item) => { setTab("preview"); startEdit("earnings", item); }}/>
          <CalculationTable title="Deduction calculation" tone="deduction" items={draft.deductions} allEarnings={draft.earnings} onEdit={(item) => { setTab("preview"); startEdit("deductions", item); }}/>
          <div className="pt-final-calc"><div><span>Gross earnings</span><b>{currency(totals.earnings)}</b></div><span className="pt-operator">−</span><div><span>Total deductions</span><b>{currency(totals.deductions)}</b></div><span className="pt-operator">=</span><div className="is-net"><span>Net pay</span><b>{currency(totals.net)}</b></div></div>
          <p className="pt-config-note">Calculation rules are configurable for this template. Percentage rules use the selected earning component as their base; quantity rules multiply quantity by rate.</p>
        </>}
        {error && <p className="pt-error" role="alert">{error}</p>}
      </div>
      <footer className="pt-footer"><span>{editing ? "Save or cancel the component edit to continue." : "Changes are kept in this session only."}</span><div><button className="pt-cancel" onClick={() => closeTemplate(true)}>Cancel</button><button className="pt-save" disabled={Boolean(editing)} onClick={saveTemplate}><Save size={15}/>Save Template</button></div></footer>
    </section></div>}
  </section>;
}

function Ledger({ title, tone, items, allEarnings, editing, rowDraft, error, setRowDraft, startEdit, saveRow, cancelEdit, removeRow, onAdd }) {
  const total = items.reduce((sum, item) => sum + evaluate(item, allEarnings), 0);
  const section = tone === "earning" ? "earnings" : "deductions";
  return <section className={`pt-ledger pt-${tone}`}><header><h3>{title}</h3><span>{items.length} items</span></header><div className="pt-ledger-labels"><span>Component</span><span>Calculation</span><span>Amount</span><span/></div>{items.map((item) => {
    const isEditing = editing === `${section}:${item.id}`;
    return <div className={`pt-line${isEditing ? " is-editing" : ""}`} key={item.id}>
      {isEditing ? <div className="pt-edit-row"><label>Component<input autoFocus value={rowDraft.name} onChange={(event) => setRowDraft({ ...rowDraft, name: event.target.value })}/></label><label>Calculation<select value={rowDraft.type} onChange={(event) => setRowDraft({ ...rowDraft, type: event.target.value })}><option value="fixed">Fixed Amount</option><option value="percent">Percentage</option><option value="quantity">Quantity × Rate</option></select></label>{rowDraft.type === "fixed" && <label>Amount (₹)<input type="number" min="0" step="0.01" value={rowDraft.amount} onChange={(event) => setRowDraft({ ...rowDraft, amount: event.target.value })}/></label>}{rowDraft.type === "percent" && <><label>Rate (%)<input type="number" min="0" max="100" step="0.01" value={rowDraft.percent} onChange={(event) => setRowDraft({ ...rowDraft, percent: event.target.value })}/></label><label>Based on<select value={rowDraft.baseId} onChange={(event) => setRowDraft({ ...rowDraft, baseId: event.target.value })}><option value="">{rowDraft.baseName || "Custom base amount"}</option>{allEarnings.filter((earning) => earning.id !== rowDraft.id).map((earning) => <option key={earning.id} value={earning.id}>{earning.name}</option>)}</select></label>{!rowDraft.baseId && <label>Base amount (₹)<input type="number" min="0" step="0.01" value={rowDraft.baseValue || 0} onChange={(event) => setRowDraft({ ...rowDraft, baseValue: event.target.value })}/></label>}</>}{rowDraft.type === "quantity" && <><label>Quantity<input type="number" min="0" step="0.01" value={rowDraft.quantity} onChange={(event) => setRowDraft({ ...rowDraft, quantity: event.target.value })}/></label><label>Rate (₹)<input type="number" min="0" step="0.01" value={rowDraft.rate} onChange={(event) => setRowDraft({ ...rowDraft, rate: event.target.value })}/></label></>}<span className="pt-edit-actions"><button onClick={() => saveRow(section)} aria-label={`Save ${rowDraft.name}`}><Save size={14}/>Save</button><button onClick={cancelEdit}>Cancel</button>{error && <small>{error}</small>}</span></div> : <><span className="pt-line-name">{item.name}</span><span className="pt-line-logic">{logicLabel(item, allEarnings)}</span><strong>{currency(evaluate(item, allEarnings))}</strong><span className="pt-row-actions"><button aria-label={`Edit ${item.name}`} title="Edit component" onClick={() => startEdit(section, item)}><Pencil size={14}/></button><button aria-label={`Remove ${item.name}`} title="Remove component" onClick={() => removeRow(section, item)}><Trash2 size={14}/></button></span></>}
    </div>;
  })}<button className="pt-add" onClick={onAdd}><Plus size={14}/>Add {tone === "earning" ? "Earning" : "Deduction"} Component</button><div className="pt-ledger-total"><span>Total {title}</span><strong>{currency(total)}</strong></div></section>;
}

function CalculationTable({ title, tone, items, allEarnings, onEdit }) {
  const section = tone === "earning" ? "earnings" : "deductions";
  return <section className={`pt-calc-section pt-${tone}`}><h3>{title}</h3><div className="pt-table-scroll"><table><thead><tr><th>Component</th><th>Calculation Logic</th><th>Example</th><th>Current Value</th><th>Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{logicLabel(item, allEarnings)}</td><td>{exampleLabel(item, allEarnings)}</td><td>{currency(evaluate(item, allEarnings))}</td><td><button className="pt-rule-edit" aria-label={`Edit ${item.name} calculation rule`} onClick={() => onEdit(item)}><Pencil size={13}/>Edit</button></td></tr>)}{!items.length && <tr><td colSpan="5" className="pt-empty">No components configured.</td></tr>}</tbody></table></div></section>;
}
