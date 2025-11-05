import React, { useEffect, useState } from "react";

/* Profile: show student info, upload CV (client-side localStorage), list supervisors (demo) */
export default function Profile({ user, setUser }) {
  const [cvName, setCvName] = useState(localStorage.getItem("profile_cv_name") || "");
  const [localUser, setLocalUser] = useState(user || JSON.parse(localStorage.getItem("demo_user")||"null"));

  useEffect(()=> {
    if(localUser) localStorage.setItem("demo_user", JSON.stringify(localUser));
  }, [localUser]);

  function handleFile(e){
    const f = e.target.files[0];
    if(!f) return;
    setCvName(f.name);
    // store filename only for demo (not uploading)
    localStorage.setItem("profile_cv_name", f.name);
    alert("CV saved locally (demo). In production this would upload to server.");
  }

  function updateName(e){
    const next = {...(localUser||{}), name: e.target.value};
    setLocalUser(next);
    setUser(next);
  }

  const supervisors = [
    {name:"Dr. S. Verma", dept:"Computer Science"},
    {name:"Dr. A. Singh", dept:"Electronics"}
  ];

  return (
    <div className="container">
      <h2>Profile</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Student Info</h3>
          <div className="muted">Name</div>
          <input value={localUser?.name || ""} onChange={updateName} placeholder="Your name" />
          <div className="muted" style={{marginTop:8}}>Contact</div>
          <input value={localUser?.contact||""} placeholder="Your contact" onChange={e=>{const n={...localUser,contact:e.target.value}; setLocalUser(n); setUser(n);}} />
        </div>

        <div className="card">
          <h3>Upload CV (demo)</h3>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
          <div className="muted small" style={{marginTop:8}}>Saved file: {cvName || "none"}</div>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Available Supervisors</h3>
        <div className="muted">Choose and contact in person to request supervision.</div>
        <ul>
          {supervisors.map(s=> <li key={s.name}><strong>{s.name}</strong> <span className="muted small"> — {s.dept}</span></li>)}
        </ul>
      </div>
    </div>
  );
}
