import React from 'react';
import './HomePage.css';

export const templates = [
  {
    name: 'Classic',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional',
    summary: 'Customer‑focused Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations.',
    skills: ['Cash register operations', 'POS system operation', 'Sales expertise', 'Teamwork', 'Inventory management', 'Accounts receivable', 'Financial management'],
    experience: [
      {
        company: 'ZARA - New Delhi, India',
        role: 'Retail Sales Associate',
        bullets: [
          'Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability.',
          'Implemented store layouts by leveraging awareness, attention to detail, and insightfully interacting with customers.',
          'Processed payments and maintained accurate change drawers to meet financial targets.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute & Oxford School of English, New Delhi',
    languages: [
      { name: 'Hindi', level: 'Native speaker' },
      { name: 'English', level: 'Proficiency: 12, Fluency: 82' }
    ],
    badge: '⚡ Classic',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Modern',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional',
    summary: 'Retail Sales professional with 5+ years of experience in customer service, sales, and inventory management. Proven track record of exceeding revenue targets and enhancing customer satisfaction.',
    skills: ['Cash register operation', 'POS system', 'Sales expertise', 'Teamwork', 'Inventory management', 'Financial management'],
    experience: [
      {
        company: 'ZARA, New Delhi',
        role: 'RETAIL SALES ASSOCIATE (02/2017 - Current)',
        bullets: [
          'Increased monthly sales 10% by upselling and cross-selling.',
          'Designed store layouts to improve customer flow and product visibility.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute, New Delhi',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Professional working proficiency' }
    ],
    badge: '✨ Modern',
    profileImage: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    name: 'Professional',
    nameText: 'DIY AGARWAL',
    title: 'Retail Sales Professional',
    summary: 'Results‑driven Retail Sales Associate with 5 years of experience in fast‑paced environments. Expert in customer engagement, inventory control, and sales strategy.',
    skills: ['Cash handling', 'POS systems', 'Upselling', 'Team leadership', 'Inventory control', 'Accounts receivable'],
    experience: [
      {
        company: 'ZARA, New Delhi',
        role: 'Senior Sales Associate (2017–Present)',
        bullets: [
          'Achieved 10% monthly sales growth through strategic cross‑selling.',
          'Led store layout redesign, increasing foot traffic by 15%.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '📊 Professional',
    profileImage: 'https://randomuser.me/api/portraits/women/46.jpg'
  },
  {
    name: 'Executive',
    nameText: 'ALEX JOHNSON',
    title: 'Senior Business Executive',
    summary: 'Strategic leader with 15+ years of experience in operations, business development, and P&L management. Proven ability to drive growth and build high‑performing teams.',
    skills: ['Leadership', 'Strategy', 'P&L Management', 'Team Building', 'Mergers & Acquisitions', 'Change Management'],
    experience: [
      {
        company: 'Global Corp',
        role: 'VP of Operations',
        bullets: [
          'Increased revenue by 30% over three years through market expansion and operational efficiencies.',
          'Led a team of 50+ managers across five locations.'
        ]
      }
    ],
    education: 'MBA, Harvard Business School',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Professional working' }
    ],
    badge: '🌟 Executive',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Creative',
    nameText: 'MAYA PATEL',
    title: 'Art Director & Graphic Designer',
    summary: 'Award‑winning Art Director with 8 years of experience in branding, print, and digital media. Passionate about creating visually compelling stories.',
    skills: ['Adobe Creative Suite', 'Typography', 'Branding', 'Illustration', 'UI/UX', 'Motion Graphics'],
    experience: [
      {
        company: 'Design Studio NYC',
        role: 'Senior Art Director',
        bullets: [
          'Led creative direction for global brands, resulting in 3 industry awards.',
          'Managed a team of 5 designers and freelancers.'
        ]
      }
    ],
    education: 'BFA in Graphic Design, Rhode Island School of Design',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'French', level: 'Basic' }
    ],
    badge: '🎨 Creative',
    profileImage: 'https://randomuser.me/api/portraits/women/63.jpg'
  },
  {
    name: 'Technical',
    nameText: 'ARJUN SINGH',
    title: 'Senior Software Engineer',
    summary: 'Full‑stack developer with 7 years of experience building scalable web applications. Proficient in JavaScript, Python, and cloud infrastructure.',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB', 'TypeScript', 'Docker'],
    experience: [
      {
        company: 'TechCorp',
        role: 'Lead Developer',
        bullets: [
          'Architected and deployed microservices, reducing latency by 40%.',
          'Mentored junior developers and conducted code reviews.'
        ]
      }
    ],
    education: 'B.Tech in Computer Science, IIT Delhi',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '💻 Technical',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    name: 'Marketing',
    nameText: 'SOPHIA CHEN',
    title: 'Digital Marketing Manager',
    summary: 'Data‑driven marketing professional with 6 years of experience in SEO, content marketing, and social media. Proven track record of increasing organic traffic.',
    skills: ['SEO', 'Content Strategy', 'Google Analytics', 'Social Media Advertising', 'Email Marketing', 'Marketing Automation'],
    experience: [
      {
        company: 'Marketing Agency',
        role: 'Digital Marketing Manager',
        bullets: [
          'Grew organic traffic by 150% in one year through SEO optimizations and content marketing.',
          'Managed $500k ad spend across Facebook and LinkedIn.'
        ]
      }
    ],
    education: 'MBA in Marketing, University of California',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Mandarin', level: 'Conversational' }
    ],
    badge: '📱 Marketing',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    name: 'Finance',
    nameText: 'MICHAEL OBI',
    title: 'Financial Analyst',
    summary: 'Detail‑oriented Financial Analyst with 4 years of experience in investment banking and corporate finance. Skilled in financial modeling and valuation.',
    skills: ['Financial Modeling', 'Excel', 'Valuation', 'Bloomberg', 'M&A', 'Risk Management'],
    experience: [
      {
        company: 'Goldman Sachs',
        role: 'Investment Banking Analyst',
        bullets: [
          'Supported $500M+ in M&A transactions, including due diligence and financial modeling.',
          'Prepared pitch books and client presentations.'
        ]
      }
    ],
    education: 'BSc in Finance, London School of Economics',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'French', level: 'Basic' }
    ],
    badge: '💰 Finance',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    name: 'Education',
    nameText: 'EMMA WILSON',
    title: 'High School Teacher',
    summary: 'Dedicated educator with 10 years of experience in curriculum development and student mentoring. Passionate about fostering a positive learning environment.',
    skills: ['Curriculum Design', 'Classroom Management', 'EdTech', 'Student Mentoring', 'Lesson Planning', 'Differentiated Instruction'],
    experience: [
      {
        company: 'Lincoln High School',
        role: 'History Teacher',
        bullets: [
          'Developed engaging lesson plans that improved test scores by 20%.',
          'Integrated technology into the classroom, including virtual field trips.'
        ]
      }
    ],
    education: 'MA in Education, Columbia University',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Intermediate' }
    ],
    badge: '🍎 Education',
    profileImage: 'https://randomuser.me/api/portraits/women/72.jpg'
  },
  {
    name: 'Healthcare',
    nameText: 'DR. JAMES LEE',
    title: 'Registered Nurse',
    summary: 'Compassionate and skilled Registered Nurse with 8 years of experience in critical care and emergency medicine. Committed to providing high‑quality patient care.',
    skills: ['Patient Care', 'Emergency Response', 'IV Therapy', 'Wound Care', 'EPIC', 'CPR/BLS'],
    experience: [
      {
        company: 'City General Hospital',
        role: 'Critical Care Nurse',
        bullets: [
          'Provided direct care to critically ill patients in ICU.',
          'Monitored vital signs and adjusted treatment plans as needed.'
        ]
      }
    ],
    education: 'BSN, Johns Hopkins University',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Korean', level: 'Basic' }
    ],
    badge: '🏥 Healthcare',
    profileImage: 'https://randomuser.me/api/portraits/men/52.jpg'
  },
  {
    name: 'Legal',
    nameText: 'SARAH KAPLAN',
    title: 'Corporate Attorney',
    summary: 'Experienced corporate attorney with 9 years of practice in mergers, acquisitions, and contract law. Skilled in negotiation and legal research.',
    skills: ['Contract Drafting', 'Negotiation', 'M&A', 'Legal Research', 'Corporate Governance', 'Compliance'],
    experience: [
      {
        company: 'Law Firm LLP',
        role: 'Senior Associate',
        bullets: [
          'Advised clients on multi‑million dollar transactions.',
          'Drafted and reviewed complex commercial agreements.'
        ]
      }
    ],
    education: 'JD, Yale Law School',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'German', level: 'Professional working' }
    ],
    badge: '⚖️ Legal',
    profileImage: 'https://randomuser.me/api/portraits/women/27.jpg'
  },
  {
    name: 'Architecture',
    nameText: 'CARLOS MENDEZ',
    title: 'Licensed Architect',
    summary: 'Creative and detail‑oriented architect with 12 years of experience in residential and commercial projects. Proficient in sustainable design.',
    skills: ['AutoCAD', 'Revit', 'SketchUp', 'Building Codes', 'Project Management', 'Sustainable Design'],
    experience: [
      {
        company: 'Mendez Architects',
        role: 'Lead Architect',
        bullets: [
          'Designed 20+ residential and commercial buildings.',
          'Managed client relationships and contractor coordination.'
        ]
      }
    ],
    education: 'M.Arch, University of Texas',
    languages: [
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '🏛️ Architecture',
    profileImage: 'https://randomuser.me/api/portraits/men/36.jpg'
  },
  {
    name: 'Hospitality',
    nameText: 'ANNA KOWALSKI',
    title: 'Hotel Manager',
    summary: 'Accomplished hotel manager with 10+ years of experience in luxury hospitality. Expertise in operations, staff training, and guest satisfaction.',
    skills: ['Front Office Management', 'Housekeeping', 'Revenue Management', 'Staff Training', 'Guest Relations', 'Budgeting'],
    experience: [
      {
        company: 'Grand Hotel',
        role: 'General Manager',
        bullets: [
          'Oversaw all hotel operations, including 150 rooms and 50 staff.',
          'Increased RevPAR by 15% through yield management strategies.'
        ]
      }
    ],
    education: 'Bachelor in Hospitality Management, Cornell University',
    languages: [
      { name: 'Polish', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '🏨 Hospitality',
    profileImage: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    name: 'Engineering',
    nameText: 'VIKRAM RAO',
    title: 'Mechanical Engineer',
    summary: 'Innovative mechanical engineer with 6 years of experience in product design and manufacturing. Skilled in CAD, FEA, and prototyping.',
    skills: ['SolidWorks', 'AutoCAD', 'FEA', 'GD&T', 'Project Management', '3D Printing'],
    experience: [
      {
        company: 'Tech Manufacturing',
        role: 'Design Engineer',
        bullets: [
          'Designed components for industrial machinery, reducing production costs by 12%.',
          'Conducted stress analysis and optimized designs for durability.'
        ]
      }
    ],
    education: 'B.Tech in Mechanical Engineering, IIT Bombay',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '🔧 Engineering',
    profileImage: 'https://randomuser.me/api/portraits/men/41.jpg'
  },
  {
    name: 'Sales',
    nameText: 'JESSICA TAN',
    title: 'Account Executive',
    summary: 'Top‑performing sales professional with 5 years of B2B experience in the tech industry. Consistently exceeded quotas through consultative selling.',
    skills: ['B2B Sales', 'CRM (Salesforce)', 'Negotiation', 'Lead Generation', 'Cold Calling', 'Pipeline Management'],
    experience: [
      {
        company: 'SaaS Corp',
        role: 'Senior Account Executive',
        bullets: [
          'Closed $2M in new business in fiscal year 2023.',
          'Managed key enterprise accounts, achieving 120% of quota.'
        ]
      }
    ],
    education: 'BA in Communications, University of Sydney',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Mandarin', level: 'Conversational' }
    ],
    badge: '📈 Sales',
    profileImage: 'https://randomuser.me/api/portraits/women/62.jpg'
  },
  {
    name: 'HR',
    nameText: 'DAVID KIM',
    title: 'Human Resources Manager',
    summary: 'Strategic HR leader with 8 years of experience in talent acquisition, employee relations, and performance management.',
    skills: ['Recruiting', 'Employee Relations', 'Performance Management', 'HRIS', 'Labor Law', 'Diversity & Inclusion'],
    experience: [
      {
        company: 'Global Enterprises',
        role: 'HR Manager',
        bullets: [
          'Led recruitment for 200+ positions annually, reducing time‑to‑fill by 20%.',
          'Implemented new performance review system.'
        ]
      }
    ],
    education: 'Master’s in HR Management, Rutgers University',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Korean', level: 'Native' }
    ],
    badge: '🤝 HR',
    profileImage: 'https://randomuser.me/api/portraits/men/28.jpg'
  },
  {
    name: 'Data Science',
    nameText: 'RACHEL GREEN',
    title: 'Data Scientist',
    summary: 'PhD‑level data scientist with 4 years of industry experience in machine learning and statistical analysis. Passionate about turning data into insights.',
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Data Visualization', 'Statistics'],
    experience: [
      {
        company: 'Analytics Corp',
        role: 'Senior Data Scientist',
        bullets: [
          'Developed predictive models that improved customer retention by 15%.',
          'Built dashboards for executive decision‑making.'
        ]
      }
    ],
    education: 'PhD in Statistics, Stanford University',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'German', level: 'Basic' }
    ],
    badge: '📊 Data Science',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Project Management',
    nameText: 'CHRIS MARTIN',
    title: 'Project Manager (PMP)',
    summary: 'Certified Project Manager with 7 years of experience leading cross‑functional teams in software development and infrastructure projects.',
    skills: ['Project Planning', 'Agile/Scrum', 'Risk Management', 'Budgeting', 'JIRA', 'Stakeholder Communication'],
    experience: [
      {
        company: 'Tech Solutions',
        role: 'Project Manager',
        bullets: [
          'Delivered 10+ software projects on time and under budget.',
          'Facilitated daily stand‑ups and sprint planning.'
        ]
      }
    ],
    education: 'BSc in Business Administration; PMP certified',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Intermediate' }
    ],
    badge: '📋 PM',
    profileImage: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  {
    name: 'Customer Service',
    nameText: 'LISA WONG',
    title: 'Customer Service Lead',
    summary: 'Dedicated customer service professional with 6 years of experience in high‑volume call centers and team leadership.',
    skills: ['Conflict Resolution', 'CRM (Zendesk)', 'Team Leadership', 'Communication', 'Problem Solving', 'Empathy'],
    experience: [
      {
        company: 'Telecom Inc',
        role: 'Customer Service Lead',
        bullets: [
          'Supervised team of 15 agents, achieving 95% satisfaction rating.',
          'Handled escalated complaints and resolved complex issues.'
        ]
      }
    ],
    education: 'Associate Degree in Communications',
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Cantonese', level: 'Conversational' }
    ],
    badge: '📞 Support',
    profileImage: 'https://randomuser.me/api/portraits/women/39.jpg'
  },
  {
    name: 'Administrative',
    nameText: 'MARY JOHNSON',
    title: 'Executive Assistant',
    summary: 'Highly organized executive assistant with 10 years of experience supporting C‑suite executives. Proficient in calendar management.',
    skills: ['Calendar Management', 'Travel Arrangements', 'Microsoft Office', 'Communication', 'Event Planning', 'Confidentiality'],
    experience: [
      {
        company: 'Fortune 500',
        role: 'Executive Assistant to CEO',
        bullets: [
          'Managed complex calendar and travel for CEO.',
          'Prepared board materials and meeting minutes.'
        ]
      }
    ],
    education: 'BA in Business Administration',
    languages: [
      { name: 'English', level: 'Native' }
    ],
    badge: '📁 Admin',
    profileImage: 'https://randomuser.me/api/portraits/women/71.jpg'
  }
];

const AllTemplatesPage = () => {
  return (
    <div className="rb-all-templates-page">
      {/* Visual background overlay */}
      <div className="rb-mesh-overlay"></div>
      
      <div className="rb-container">
        <header className="rb-page-header">
          <h1 className="rb-page-title">Resume Gallery</h1>
          <p className="rb-page-subtitle">
            Choose from 20+ professionally designed layouts tailored to your industry.
          </p>
        </header>

        <div className="rb-all-templates-grid">
          {templates.map((template, index) => (
            <div className="rb-template-full-card" key={index}>
              {/* Category Badge */}
              <div className="rb-card-badge">
                {template.badge}
              </div>
              
              {/* Visual Resume Preview Area */}
              <div className="rb-card-preview-area">
                <div className="rb-preview-inner">
                  <div className="rb-preview-header">
                    <div className="rb-preview-img-box">
                      <img 
                        src={template.profileImage} 
                        alt={template.nameText} 
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                    </div>
                    <div className="rb-preview-text">
                      <h5>{template.nameText}</h5>
                      <span className="rb-preview-role">{template.title}</span>
                    </div>
                  </div>
                  
                  <div className="rb-preview-body">
                    <p className="rb-preview-summary">
                      {template.summary.substring(0, 85)}...
                    </p>
                    <div className="rb-preview-skills">
                      {template.skills.slice(0, 3).map((skill, sIndex) => (
                        <span key={sIndex} className="rb-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Label Footer */}
              <div className="rb-card-footer">
                <h3 className="rb-template-label-title">{template.name} Template</h3>
                <div className="rb-card-actions">
                  <button className="rb-btn-use-template">
                    Use This Design
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllTemplatesPage;