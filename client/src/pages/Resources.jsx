import React from "react";

/* Resources: add links, templates, sample report downloads (links are demo placeholders) */
export default function Resources() {
  const resources = [
    { id:1, title:"Project Report Template (DOCX)", url:"#", type:"Template" },
    { id:2, title:"Paper: Deep Learning for Attendance", url:"#", type:"Paper" },
    { id:3, title:"GitHub Starter Boilerplate", url:"#", type:"Code" },
  ];

  return (
    <div className="container">
      <h2>Resources for 3rd Year Projects</h2>
      <div className="card">
        <p className="muted">Useful templates, sample papers and code starters to accelerate your project.</p>
        <div className="list">
          {resources.map(r=>(
            <div key={r.id} className="resource-item">
              <div>
                <strong>{r.title}</strong>
                <div className="muted small">{r.type}</div>
              </div>
              <div>
                <a className="btn btn-outline" href={r.url}>Download</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Checklist for Project Submission</h3>
        <ol>
          <li>Title & Abstract (max 300 words)</li>
          <li>Proposal PDF + Supervisor approval</li>
          <li>Final report & presentation slides</li>
          <li>Source code repository link</li>
        </ol>
      </div>
    </div>
  );
}
