import React from 'react';
import { Activity, ArrowRight, BookOpen, Building2, CircleCheck, CircleX, Clock3, Dumbbell, FileCheck2, GraduationCap, HeartPulse, Users } from 'lucide-react';
import Sidebar from './Sidebar';
import './AdminDashboardContent.css';

const Tile = ({ tone, children }) => <span className={`adc-tile ${tone}`}>{children}</span>;
const Stats = ({ label, value, note, icon, tone }) => <article className="adc-stat"><div><span>{label}</span><Tile tone={tone}>{icon}</Tile></div><strong>{value}</strong><small>{note}</small></article>;
const Heading = ({ tone, icon, children }) => <h2 className={tone}>{icon}{children}</h2>;

function GridSvg({ type }) {
  const timesheets = type === 'timesheets';
  const bars = type === 'bars';
  const labels = bars ? ['Onboarding', 'Compliance', 'Tech Skills', 'Leadership'] : timesheets ? ['W1', 'W2', 'W3', 'W4'] : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const numbers = bars ? [100, 75, 50, 25, 0] : timesheets ? [2200, 1650, 1100, 550, 0] : [600, 450, 300, 150, 0];
  const path = timesheets ? 'M50 60 C160 55 240 47 316 58 S458 79 524 65 S623 44 680 35' : 'M50 198 C140 176 212 160 260 145 S380 112 470 86 S587 47 680 16';
  return <svg className="adc-svg" viewBox="0 0 720 286" role="img" aria-label={type}>
    <defs><linearGradient id={`fill-${type}`} x1="0" x2="0" y2="1"><stop stopColor={timesheets ? '#ff8b00' : '#2763eb'} stopOpacity=".22"/><stop offset="1" stopColor={timesheets ? '#ff8b00' : '#2763eb'} stopOpacity="0"/></linearGradient></defs>
    {numbers.map((value, i) => { const y = 20 + i * 54; return <g key={value}><line x1="50" x2="680" y1={y} y2={y}/><text x="39" y={y + 5} textAnchor="end">{value}</text></g>; })}
    {bars ? [['Onboarding',78],['Compliance',92],['Tech Skills',64],['Leadership',48]].map(([name,value],i)=>{const x=115+i*158,h=value*2.16;return <g key={name}><rect x={x} y={236-h} width="48" height={h} rx="7"/><text x={x+24} y="258" textAnchor="middle">{name}</text></g>;}) : <><path d={`${path} L680 236 L50 236 Z`} fill={`url(#fill-${type})`}/><path d={path}/>{labels.map((label,i)=><text key={label} x={timesheets ? 50+i*210 : 50+i*105} y="258" textAnchor={timesheets && i===0 ? 'start' : timesheets && i===3 ? 'end' : 'middle'}>{label}</text>)}</>}
  </svg>;
}

const Approval = ({ initials, name, date }) => <div className="adc-approval"><i>{initials}</i><div><b>{name}</b><small>{date}</small></div><button aria-label={`Approve ${name}`}><CircleCheck/></button><button aria-label={`Reject ${name}`}><CircleX/></button></div>;
const Event = ({ initials, tone, children, time }) => <div className="adc-event"><i className={tone}>{initials}</i><div><p>{children}</p><small>{time}</small></div></div>;
const Course = ({ title, details, status }) => <div className="adc-course"><Tile tone="purple"><BookOpen size={20}/></Tile><div><b>{title}</b><small>{details}</small></div><em className={status === 'Draft' ? 'draft' : ''}>{status}</em></div>;

export default function AdminDashboardContent() {
  const statCards = [
    ['Total Users','1',<><mark>+12%</mark> vs last month</>,<Users size={22}/>,'blue'],
    [<>Active<br/>Organizations</>,'3',<><mark>+3</mark> new this month</>,<Building2 size={22}/>,'blue'],
    ['Total Courses','6',<><mark>+8%</mark> vs last month</>,<BookOpen size={22}/>,'purple'],
    [<>Pending<br/>Timesheets</>,'2','awaiting approval',<Clock3 size={22}/>,'orange'],
    [<>Pending<br/>Compliance</>,'1','need review',<FileCheck2 size={22}/>,'orange'],
    [<>Active Wellness<br/>Programs</>,'6',<><mark>+5</mark> new programs</>,<HeartPulse size={22}/>,'green'],
  ];
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <main className="admin-dashboard-content">
          <section className="adc-stats">{statCards.map(([label,value,note,icon,tone],i)=><Stats key={i} label={label} value={value} note={note} icon={icon} tone={tone}/>)}</section>
          <section className="adc-charts">
            <article><Heading tone="blue" icon={<Activity/>}>User Growth</Heading><GridSvg type="growth"/></article>
            <article><Heading tone="purple" icon={<GraduationCap/>}>Learning Completion</Heading><GridSvg type="bars"/></article>
            <article className="adc-wellness"><Heading tone="green" icon={<HeartPulse/>}>Wellness Participation</Heading><div className="adc-donut"/><div className="adc-legend"><span>Fitness</span><span>Nutrition</span><span>Mental Health</span></div></article>
            <article><Heading tone="orange" icon={<Activity/>}>Timesheet Trends</Heading><GridSvg type="timesheets"/></article>
          </section>
          <section className="adc-lists">
            <article><h2>Pending Approvals</h2><Approval initials="AR" name="Arav Kumar" date="2026-09-08 · 7.75h"/><Approval initials="ME" name="Meera Iyer" date="2026-09-07 · 8.5h"/></article>
            <article><h2>Recent Activity</h2><Event initials="P" tone="blue" time="2h ago"><b>Priya Sharma</b> submitted a timesheet</Event><Event initials="A" tone="purple" time="5h ago"><b>Arav Kumar</b> completed "Python Basics"</Event><Event initials="L" tone="green" time="1d ago"><b>Lernevo Tech</b> added a new organization</Event><Event initials="M" tone="amber" time="1d ago"><b>Meera Iyer</b> started "Morning Yoga"</Event></article>
            <article className="adc-content"><h2>Recent Content <button>View all <ArrowRight size={18}/></button></h2><Course title="Python Basics for Beginners" details="12 lessons · 148 learners" status="Published"/><Course title="React Fundamentals" details="18 lessons · 96 learners" status="Published"/><Course title="Workplace Compliance 101" details="8 lessons · 212 learners" status="Published"/><Course title="Leadership Essentials" details="10 lessons · 0 learners" status="Draft"/></article>
          </section>
          <section className="adc-actions"><h2>Quick Actions</h2><div>{[[Users,'blue','Add User'],[BookOpen,'purple','Create Course'],[Dumbbell,'green','Add Workout'],[Clock3,'orange','Review Timesheets']].map(([Icon,tone,text])=><button key={text}><Tile tone={tone}><Icon size={23}/></Tile>{text}<ArrowRight/></button>)}</div></section>
        </main>
      </div>
    </div>
  );
}