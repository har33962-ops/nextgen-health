import React, { useState } from "react";

/* Projects page: project ideas, submit proposal (client-side mock), group members */
export default function Projects({ user }) {
  const sampleIdeas = [
    { id: 1, title: "Smart Attendance (CV)", desc: "Face recognition + attendance automation.", tags: ["CV","ML"] },
    { id: 2, title: "IoT Health Monitor", desc: "Wearable data aggregator + dashboard.", tags: ["IoT","Embedded"] },
    { id: 3, title: "Energy Optimizer", desc: "Microgrid load prediction & control.", tags: ["Power","ML"] },
  ];

  const [ideas] = useState(sampleIdeas);
  const [proposals, setProposals] = useState(JSON.parse(localStorage.getItem("proj_proposals")||"[]"));
  const [form, setForm] = useState({ title:"", domain:"", summary:"", members:"" });

  function submit(e){
    e.preventDefault();
    const p = { ...form, id: "pr_"+Date.now(), student: user?.name || "Guest", createdAt: new Date().toISOString(), status: "Proposed" };
    const next = [p, ...proposals];
    setProposals(next);
    localStorage.setItem("proj_proposals", JSON.stringify(next));
    setForm({ title:"", domain:"", summary:"", members:"" });
    alert("Proposal submitted (demo). You can view it below.");
  }

  return (
    <div className="container">
      <h2>Project Ideas & Proposals</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Starter ideas</h3>
          <div className="muted">Pick an idea or submit your own proposal.</div>
          <ul>
            {ideas.map(i=>(
              <li key={i.id} style={{marginTop:8}}>
                <strong>{i.title}</strong><div className="muted small">{i.desc}</div>
                <div style={{marginTop:6}}>{i.tags.map(t=> <span key={t} className="badge">{t}</span>)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Submit Proposal</h3>
          <form onSubmit={submit} className="form-compact">
            <input placeholder="Project title" value={form.title} onChange={e=>setForm(s=>({...s,title:e.target.value}))} />
            <input placeholder="Domain (eg. ML, IoT)" value={form.domain} onChange={e=>setForm(s=>({...s,domain:e.target.value}))} />
            <textarea placeholder="Short summary" value={form.summary} onChange={e=>setForm(s=>({...s,summary:e.target.value}))} />
            <input placeholder="Team members (comma separated)" value={form.members} onChange={e=>setForm(s=>({...s,members:e.target.value}))} />
            <div className="form-row">
              <button className="btn">Submit Proposal</button>
              <button type="button" className="btn btn-outline" onClick={()=>setForm({title:"",domain:"",summary:"",members:""})}>Clear</button>
            </div>
          </form>
        </div>
      </div>

      <div style={{marginTop:18}} className="card">
        <h3>Your proposals (demo)</h3>
        {proposals.length===0 ? <div className="muted">No proposals yet</div> :
          proposals.map(p=>(
            <div key={p.id} style={{padding:12, borderBottom:"1px dashed #eee"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div><strong>{p.title}</strong><div className="muted small">by {p.student} • {new Date(p.createdAt).toLocaleString()}</div></div>
                <div className="status">{p.status}</div>
              </div>
              <div style={{marginTop:8}}>{p.summary}</div>
              <div className="muted small" style={{marginTop:8}}>Members: {p.members || "–"}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
