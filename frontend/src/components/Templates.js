import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// Dynamically import template images
const templatesContext = require.context('./templates', false, /\.png$/);
const templateImages = templatesContext.keys().map(templatesContext);

const templates = [
  { id: 1, name: 'Classic Sidebar', structure: 'sidebar-left', image: templateImages[1] },
  { id: 2, name: 'Modern Centered', structure: 'top-centered', image: templateImages[2] },
  { id: 3, name: 'Graphic Designer', structure: 'minimal-no-photo', image: templateImages[3] },
  { id: 4, name: 'Executive Grid', structure: 'executive-grid', image: templateImages[4] },
  { id: 5, name: 'Top Bar Bold', structure: 'header-bg', image: templateImages[5] },
  { id: 6, name: 'Creative Asymmetry', structure: 'asymmetric', image: templateImages[6] },
  { id: 7, name: 'Professional Card', structure: 'professional-card', image: templateImages[7] },
  { id: 8, name: 'Technical Compact', structure: 'compact', image: templateImages[8] },
  { id: 9, name: 'Infographic Style', structure: 'infographic', image: templateImages[9] },
  { id: 10, name: 'Minimalist No Photo', structure: 'minimal-no-photo', image: templateImages[10] },
  { id: 11, name: 'Two Column Modern', structure: 'two-column', image: templateImages[11] },
  { id: 12, name: 'Sidebar Right', structure: 'sidebar-right', image: templateImages[12] },
  { id: 13, name: 'Header with Background', structure: 'header-bg', image: templateImages[13] },
  { id: 14, name: 'Bold Dark Sidebar', structure: 'sidebar-left', image: templateImages[14] },
  { id: 15, name: 'Light Pastel', structure: 'pastel', image: templateImages[15] },
  { id: 16, name: 'Card Style', structure: 'card-style', image: templateImages[16] },
  { id: 17, name: 'Timeline Experience', structure: 'timeline', image: templateImages[17] },
  { id: 18, name: 'Grid Skills', structure: 'grid-skills', image: templateImages[18] },
  { id: 19, name: 'Minimal with Accent', structure: 'minimal-accent', image: templateImages[19] },
  { id: 20, name: 'Creative Stack', structure: 'creative-stack', image: templateImages[20] },

  // 👇 Blank Document last
  { id: 0, name: 'Blank Document', structure: 'blank-start', image: templateImages[0] },
];

const AllTemplatesPage = () => {

  const navigate = useNavigate();
  const fixedColor = '#2563eb';

  return (
    <div className="rb-all-templates-page">
      <div className="rb-container">

        <header className="rb-page-header">
          <h1>Resume Gallery</h1>
          <p>Choose your perfect style – every design is distinct.</p>
        </header>

        <div className="rb-all-templates-grid">

          {templates.map((tpl) => (

            <div className="rb-template-full-card" key={tpl.id}>

            <div className="preview-wrapper">

  {tpl.name === "Blank Document" ? (
    <div className="blank-preview">
      <span>Blank Resume</span>
    </div>
  ) : (
    <img
      src={tpl.image}
      alt={tpl.name}
      className="template-thumbnail"
    />
  )}

</div>

              <div className="tpl-label">{tpl.name}</div>

              <div className="rb-card-footer">

                <button
                  className="use-btn"
                  style={{ backgroundColor: fixedColor }}
                  onClick={() =>
                    navigate('/builder', {
                      state: {
                        template: tpl,
                        selectedColor: fixedColor,
                      },
                    })
                  }
                >
                  Use Design
                </button>

                <button className="btn-dl">
                  PDF
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
};

export default AllTemplatesPage;