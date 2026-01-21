import React, { useState } from 'react';
import './faq.css';
import Navbar from './Navbar';
import { 
  FaChevronDown, FaChevronUp, FaSearch, FaRocket, FaMagic, 
  FaUserFriends, FaLock, FaRobot, FaUtensils, FaBrain, 
  FaDumbbell, FaBullseye, FaComments, FaSearchPlus,
  FaTwitter, FaInstagram, FaLinkedin, FaYoutube 
} from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Getting Started');

const categories = [
    { name: "Getting Started", icon: <FaRocket />, color: "#6366f1" },
    { name: "Personalised Intake", icon: <FaMagic />, color: "#ec4899" },
    { name: "Goal & Progress", icon: <FaBullseye />, color: "#f59e0b" },
    { name: "Nutrition & Diet", icon: <FaUtensils />, color: "#8b5cf6" },
    { name: "Fitness & Training", icon: <FaDumbbell />, color: "#ef4444" },
    { name: "Mental Wellbeing", icon: <FaBrain />, color: "#06b6d4" },
    { name: "Admin & Trainers", icon: <FaUserFriends />, color: "#10b981" },
    { name: "Message Centre", icon: <FaComments />, color: "#a855f7" },
    { name: "Daily Tracking", icon: <FaSearchPlus />, color: "#64748b" },
    { name: "Privacy & Security", icon: <FaLock />, color: "#3b82f6" }
  ];

  const getHighlightedText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
          <mark key={i} className="highlight-mark">{part}</mark> : part
        )}
      </span>
    );
  };

  const faqItems = [
    // 1. Getting Started
    { category: "Getting Started", question: "What is Lernevo Wellness?", answer: "Lernevo is an all-in-one AI companion for holistic well-being, integrating learning, fitness, nutrition, and mental health." },
    //{ category: "Getting Started", question: "How does the B2B2C model work?", answer: "Organizations partner with Lernevo to provide personalized wellness portals for their employees and trainers." },
    { category: "Getting Started", question: "What is the mission of Lernevo?", answer: "To transform well-being through innovative AI solutions, focusing on mind, body, and personal growth." },
    { category: "Getting Started", question: "Who are the three key users?", answer: "The platform flow is designed for Administrators, Trainers, and End Users (Employees)." },
    { category: "Getting Started", question: "What is 'Mission Control'?", answer: "It is our unified dashboard that acts as the single source of truth for your daily wellness journey." },
    { category: "Getting Started", question: "How do I start my journey?", answer: "Sign up through your company portal and complete the mandatory digital intake form." },
    //{ category: "Getting Started", question: "Is Lernevo free for employees?", answer: "Yes, access is provided as a benefit by your organization." },
    { category: "Getting Started", question: "Can I use Lernevo on my phone?", answer: "Absolutely. Lernevo is a mobile-responsive web platform designed for daily use anywhere." },
    { category: "Getting Started", question: "Does it help with work-life balance?", answer: "Yes, our modules are designed for remote-first environments to improve productivity and health." },
    //{ category: "Getting Started", question: "What makes Lernevo different?", answer: "We solve 'data fragmentation' by unifying all health data into one AI-driven ecosystem." },

    // 2. Personalised Intake
    { category: "Personalised Intake", question: "What info is needed for the intake?", answer: "We collect personal details, lifestyle habits, food preferences, and medical history to ensure a safe plan." },
    { category: "Personalised Intake", question: "How does Gemini AI use my data?", answer: "The system creates a custom prompt from your data and sends it to Gemini to generate your unique meal and workout plans." },
    { category: "Personalised Intake", question: "Why is the intake form mandatory?", answer: "Without this data, the AI cannot generate the hyper-personalized strategies required for your goals." },
    { category: "Personalised Intake", question: "Can I update my food dislikes?", answer: "Yes, you can edit your profile preferences at any time to update your future meal suggestions." },
    { category: "Personalised Intake", question: "What is a 'Life Structure' approach?", answer: "It determines how the AI schedules your tasks—whether you prefer a high-discipline or flexible routine." },
    { category: "Personalised Intake", question: "Do you ask about my goals?", answer: "Yes, you specify what you want to achieve, how you want to do it, and in how many days." },
    { category: "Personalised Intake", question: "Is the intake info kept private?", answer: "Yes, individual records are stored separately for each user and organization." },
    //{ category: "Personalised Intake", question: "What if my health status changes?", answer: "You can re-submit the intake form to recalibrate your entire wellness package." },
    //{ category: "Personalised Intake", question: "Does the AI consider my equipment?", answer: "Yes, you can mention if you have gym access or prefer home-based bodyweight exercises." },
    //{ category: "Personalised Intake", question: "How fast is the plan generated?", answer: "Instantly. Once the form is submitted, the AI streamlines and structures your plan in seconds." },

    // 3. Goal & Progress
    { category: "Goal & Progress", question: "How do I track my progress?", answer: "Use the 'Whole Week Activity' view to see your consistency and task completion rates." },
    { category: "Goal & Progress", question: "Can I change my goal mid-way?", answer: "Yes, you can update your goals and the AI will generate a new path for the remaining days." },
    { category: "Goal & Progress", question: "What are 'Milestones'?", answer: "These are small achievements recorded by the system as you progress toward your main goal." },
    { category: "Goal & Progress", question: "How does the AI handle missed goals?", answer: "It analyzes why you missed it and suggests a 'Compensation Strategy' to catch up." },
    { category: "Goal & Progress", question: "Is there a weight tracker?", answer: "Yes, you can log your weight and measurements to see a visual progress chart." },
    { category: "Goal & Progress", question: "Does the trainer see my progress?", answer: "Yes, your assigned trainer monitors your progress to provide real-time coaching." },
    { category: "Goal & Progress", question: "What is the 'Daily Score'?", answer: "A metric from 1-100 reflecting how well you followed your personalized plan each day." },
    //{ category: "Goal & Progress", question: "Can I set a 'Days to Achieve' target?", answer: "Yes, you define the duration, and the AI structures the workload specifically for that period." },
    //{ category: "Goal & Progress", question: "Are there badges for progress?", answer: "Yes, you unlock digital badges for completing streaks and hitting major milestones." },
    { category: "Goal & Progress", question: "Can I export my progress report?", answer: "Yes, Admins and Users can generate a summary of their activity history." },

    // 4. Nutrition & Diet
    { category: "Nutrition & Diet", question: "How are meal plans generated?", answer: "Part of the plan comes from our expert database, and specific daily meals are generated by Gemini AI." },
    { category: "Nutrition & Diet", question: "Can I specify food preferences?", answer: "Yes, the AI creates meal plans based on your preferred foods and excludes dislikes." },
    //{ category: "Nutrition & Diet", question: "Does the plan change daily?", answer: "Yes, Lernevo provides different food options for each day to keep your diet interesting." },
    //{ category: "Nutrition & Diet", question: "What if I have allergies?", answer: "Allergies mentioned in the intake form are strictly used as filters in the AI prompt generation." },
    { category: "Nutrition & Diet", question: "Are recipes included?", answer: "Yes, each meal suggestion comes with structured details on how to prepare it." },
    { category: "Nutrition & Diet", question: "Can I track my water intake?", answer: "Yes, hydration tracking is built into the daily dashboard." },
    { category: "Nutrition & Diet", question: "Does it support Keto or Vegan diets?", answer: "Yes, the AI is capable of structuring plans for any specific dietary lifestyle." },
    { category: "Nutrition & Diet", question: "How are portion sizes calculated?", answer: "Portions are based on the calorie and macro requirements derived from your intake data." },
    { category: "Nutrition & Diet", question: "Can I log a meal not in the plan?", answer: "Yes, you can manually log external meals to maintain an accurate daily record." },
    { category: "Nutrition & Diet", question: "Does the trainer review my diet?", answer: "Yes, your trainer can see your logs and suggest adjustments via the Message Centre." },

    // 5. Fitness & Training
    { category: "Fitness & Training", question: "What kind of workouts are provided?", answer: "The AI generates a complete package including strength, cardio, and flexibility training." },
    { category: "Fitness & Training", question: "How does the AI choose exercises?", answer: "It analyzes your fitness level and equipment availability to create a tailored workout prompt." },
    { category: "Fitness & Training", question: "Can I workout with my team?", answer: "Yes, Admins can create workout groups to foster collective health and accountability." },
    { category: "Fitness & Training", question: "What if an exercise is too hard?", answer: "You can log feedback, and the AI will suggest a simpler alternative for the next session." },
    { category: "Fitness & Training", question: "Is there a warm-up included?", answer: "Yes, every structured workout plan includes warm-up and cool-down phases." },
    { category: "Fitness & Training", question: "How do I log a finished workout?", answer: "Simply tick the task on your dashboard once you complete the session." },
    { category: "Fitness & Training", question: "Does it support wearable devices?", answer: "Yes, we integrate device data to solve fragmentation and provide a holistic view." },
    { category: "Fitness & Training", question: "Can I set the frequency of workouts?", answer: "Yes, you decide how many days a week you want to train during the intake." },
    { category: "Fitness & Training", question: "Are there video tutorials?", answer: "Standard exercises from our database include visual guides for correct form." },
    { category: "Fitness & Training", question: "What is 'Adaptive Intensity'?", answer: "The AI increases or decreases the difficulty based on your previous task performance." },

    // 6. Mental Wellbeing
    { category: "Mental Wellbeing", question: "Is mental health part of the plan?", answer: "Yes, Lernevo integrates mental health support as a core pillar of holistic wellness." },
    { category: "Mental Wellbeing", question: "What are Learning Modules?", answer: "These are educational resources to help you understand stress, sleep, and emotional health." },
    { category: "Mental Wellbeing", question: "Does it track my mood?", answer: "Yes, you can log your daily mood, and the AI will adjust its suggestions accordingly." },
    { category: "Mental Wellbeing", question: "Are there meditation exercises?", answer: "Yes, mindfulness and meditation tasks are included in your daily routine." },
    { category: "Mental Wellbeing", question: "Can the AI detect burnout?", answer: "By analyzing activity patterns and mood logs, the system can flag signs of over-exhaustion." },
    { category: "Mental Wellbeing", question: "How does it help with work stress?", answer: "We provide specific micro-breaks and focus modules designed for office/remote environments." },
    { category: "Mental Wellbeing", question: "Are my mental health logs private?", answer: "Yes, they are encrypted and handled with the highest level of privacy." },
    { category: "Mental Wellbeing", question: "Can I talk to my trainer about stress?", answer: "Yes, the Message Centre allows you to discuss all aspects of wellness with your coach." },
    { category: "Mental Wellbeing", question: "Is the content based on science?", answer: "Yes, our database information is curated from verified wellness and psychological resources." },
    { category: "Mental Wellbeing", question: "How often should I do mental health tasks?", answer: "The AI suggests daily micro-tasks to ensure long-term emotional resilience." },

    // 7. Admin & Trainers
    { category: "Admin & Trainers", question: "What access does an Admin have?", answer: "Admins view overall stats like active users, tasks completed, and create workout groups." },
    { category: "Admin & Trainers", question: "Can trainers see user records?", answer: "Yes, trainers can view assigned user logs to provide better coaching and support." },
    { category: "Admin & Trainers", question: "How do Admins communicate with Users?", answer: "They use the Personalised Message Centre for secure, direct communication." },
    { category: "Admin & Trainers", question: "Can Admins see my personal food list?", answer: "Admins see aggregated activity data, while specific logs are primarily for you and your trainer." },
    { category: "Admin & Trainers", question: "What is the Admin Dashboard?", answer: "A central hub to monitor organization-wide wellness engagement and weekly activity." },
    { category: "Admin & Trainers", question: "Can a trainer edit my plan?", answer: "Yes, trainers can manually override AI suggestions to add a human touch to your plan." },
    { category: "Admin & Trainers", question: "How does the hierarchy work?", answer: "The flow is Admin (Strategic) -> Trainer (Tactical) -> User (Operational/Action)." },
    { category: "Admin & Trainers", question: "Can Admins set company challenges?", answer: "Yes, they can create events to motivate the entire organization simultaneously." },
    { category: "Admin & Trainers", question: "Who handles technical support?", answer: "Admins have a direct channel to Lernevo's technical support team." },
    { category: "Admin & Trainers", question: "Is there a limit to the number of trainers?", answer: "The number of trainer slots depends on the organization's enterprise agreement." },

    // 8. Message Centre
    { category: "Message Centre", question: "What is the Personalised Message Centre?", answer: "A secure chat system for communication between Admins, Trainers, and Users." },
    { category: "Message Centre", question: "Can I ask my trainer for a plan change?", answer: "Yes, the message centre is the best place to request manual adjustments to your AI plan." },
    { category: "Message Centre", question: "Are messages real-time?", answer: "Yes, it functions like a secure instant messaging platform within the app." },
    { category: "Message Centre", question: "Can I share photos of my meals?", answer: "Yes, you can upload images to get feedback on your nutrition from your coach." },
    { category: "Message Centre", question: "Is the chat history stored?", answer: "Yes, all conversations are archived for your future reference." },
    { category: "Message Centre", question: "How do I know if I have a message?", answer: "Notifications will appear on your dashboard and in the Message Centre icon." },
    { category: "Message Centre", question: "Can I create group chats?", answer: "Admins and Trainers can create group conversations for workout groups or teams." },
    { category: "Message Centre", question: "Is the communication encrypted?", answer: "Yes, we use secure protocols to protect your private discussions." },
    { category: "Message Centre", question: "Can I mute notifications?", answer: "Yes, notification settings can be customized in your profile." },
    { category: "Message Centre", question: "How do I report a message?", answer: "There is an 'Options' menu in every chat to report inappropriate content to the Admin." },

    // 9. Daily Tracking
    { category: "Daily Tracking", question: "How do I log my daily tasks?", answer: "Your dashboard displays a checklist of workout, meal, and mental health tasks for the day." },
    { category: "Daily Tracking", question: "What if I miss a task?", answer: "The system logs it as 'Missed' and prompts the AI to generate a compensation plan." },
    { category: "Daily Tracking", question: "Can I log tasks in advance?", answer: "No, tasks are logged in real-time or retrospectively to ensure accuracy." },
    { category: "Daily Tracking", question: "Does it track my active time?", answer: "Yes, the system tracks how much time you spend on workouts and learning modules." },
    { category: "Daily Tracking", question: "How is 'Weekly Activity' calculated?", answer: "It aggregates your daily completion rates over the last 7 days." },
    { category: "Daily Tracking", question: "What is a 'Compensation Plan'?", answer: "It is an AI-generated adjustment to help you recover from missed tasks without stress." },
    { category: "Daily Tracking", question: "Does the system track steps?", answer: "Yes, if synced with a wearable, steps are displayed in the holistic dashboard." },
    { category: "Daily Tracking", question: "Can I log multiple meals at once?", answer: "Yes, you can update your nutrition log for the entire day in one go." },
    { category: "Daily Tracking", question: "Are there reminders?", answer: "Yes, the system sends nudges for workouts and meal logging." },
    { category: "Daily Tracking", question: "What does the 'Success' ring mean?", answer: "It visually shows your progress towards 100% task completion for the current day." },

    // 10. Privacy & Security
    { category: "Privacy & Security", question: "How is my personal data protected?", answer: "We use isolated database records for each client and industry-standard encryption." },
    { category: "Privacy & Security", question: "Does Lernevo sell my data?", answer: "Never. We are a mission-driven company; your wellness data is strictly for your growth." },
    { category: "Privacy & Security", question: "How are different clients differentiated?", answer: "We use unique organization identifiers (Tenant IDs) to separate user records completely." },
    { category: "Privacy & Security", question: "Is Lernevo GDPR compliant?", answer: "Yes, we follow strict international data protection and privacy standards." },
    { category: "Privacy & Security", question: "Can I delete my account?", answer: "Yes, users can request data deletion through their Admin or profile settings." },
    { category: "Privacy & Security", question: "Who can see my lifestyle details?", answer: "Only you and your assigned Trainer/Admin have access to your wellness profile." },
    { category: "Privacy & Security", question: "Is my medical info secure?", answer: "Medical data is treated with extra layers of security and used only for AI filtering." },
    { category: "Privacy & Security", question: "What happens to data when a company leaves?", answer: "Data is either transferred to the client or securely deleted as per the agreement." },
    { category: "Privacy & Security", question: "How do you prevent data leaks?", answer: "Through strict role-based access control (RBAC) and regular security audits." },
    { category: "Privacy & Security", question: "Does the AI store my personal info?", answer: "No, it processes the prompt and the results are stored in our secure database." }
  ];
  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="faq-page-wrapper">
      <Navbar />
      
      {/* Wrapper for main content to push footer down */}
      <div className="faq-content-wrapper">
        <div className="faq-main-container">
          {/* Left Sidebar */}
          <aside className="faq-sidebar-left">
            <div className="sidebar-sticky-box">
              <h3 className="sidebar-label">Categories</h3>
              <div className="categories-list">
                {categories.map((cat, idx) => (
                  <button 
                    key={idx} 
                    className={`cat-btn-modern ${activeCategory === cat.name ? 'active' : ''}`}
                    onClick={() => {setActiveCategory(cat.name); setOpenIndex(null);}}
                    style={{ "--accent": cat.color }}
                  >
                    <div className="icon-box">{cat.icon}</div>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <main className="faq-content-right">
            <div className="content-search-area">
              <div className="modern-search-box">
                <FaSearch className="s-icon" />
                <input 
                  type="text" 
                  placeholder={`Search in ${activeCategory}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="faq-results-header">
               <h2>{activeCategory}</h2>
            </div>

            <div className="questions-grid">
              {filteredFAQs.map((item, index) => (
                <div 
                  key={index} 
                  className={`premium-faq-card ${openIndex === index ? 'active' : ''}`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <div className="card-q-header">
                    <h3>{getHighlightedText(item.question, searchTerm)}</h3>
                    <div className="arrow-circle">
                      {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                  <div className={`card-a-body ${openIndex === index ? 'show' : ''}`}>
                     <p>{getHighlightedText(item.answer, searchTerm)}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* FOOTER SECTION */}
      {/* ========== FAQ PAGE FOOTER (UNIQUE FIX) ========== */}
      <footer className="faq-footer-section">
        <div className="faq-footer-container">
          <div className="faq-footer-top">

            {/* BRAND */}
            <div className="faq-footer-brand">

              <p className="faq-footer-desc">
                Your AI-powered wellness companion helping you build
                healthier habits across body, mind, and lifestyle.
              </p>

              <div className="faq-footer-social">
                <a className="faq-social-twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a className="faq-social-instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a className="faq-social-linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a className="faq-social-youtube" href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              </div>
            </div>

            {/* PRODUCT */}
            <div className="faq-footer-col">
              <h4>Product</h4>
              <a>AI Coaching</a>
              <a>Fitness</a>
              <a>Mental Wellness</a>
              <a>Nutrition</a>
            </div>

            {/* COMPANY */}
            <div className="faq-footer-col">
              <h4>Company</h4>
              <a>About</a>
              <a>Careers</a>
              <a>Blog</a>
              <a>Contact</a>
            </div>

            {/* SUPPORT */}
             <div className="link-col">
                <h4>Support</h4>
                <a>Help Center</a>
                <a>Privacy Policy</a>
                <a>Terms of Service</a>
                <a>Trust & Safety</a>
              </div>

            {/* BUSINESS */}
            <div className="link-col">
                <h4>Business</h4>
                <a>Business Dashboard</a>
                <a>Partnerships</a>
                <a>Book a demo</a>
                <a>Enquire</a>

              </div>

          </div>

          <div className="faq-footer-bottom">
            <p>© {new Date().getFullYear()} Lernevo Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;