import { useState, useEffect } from "react";
import "./App.css";

const API = "http://127.0.0.1:8002";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [task, setTask] = useState({ title: "", description: "", location: "", price: 20, urgency: "Today" });

  useEffect(() => { if (screen === "home") fetchTasks(); }, [screen]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API + "/tasks");
      if (res.ok) { const data = await res.json(); setTasks(data); }
    } catch (err) { setTasks([]); }
  };

  const handleLogin = () => {
    if (email && password) { setUserEmail(email); setScreen("home"); }
    else { alert("Please enter email and password"); }
  };

  const handlePostTask = async () => {
    if (!task.title || !task.location) { alert("Please fill in all fields"); return; }
    try {
      const res = await fetch(API + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description, location: task.location, price: task.price, urgency: task.urgency, status: "open", user_email: userEmail }),
      });
      if (res.ok) { alert("Task posted!"); setTask({ title: "", description: "", location: "", price: 20, urgency: "Today" }); setScreen("home"); }
      else { alert("Error posting task"); }
    } catch (err) { alert("Error posting task"); }
  };

  const handleAccept = async (id) => {
    try { await fetch(API + "/tasks/" + id + "?status=accepted", { method: "PUT" }); alert("Task accepted!"); fetchTasks(); setScreen("home"); }
    catch (err) { alert("Error"); }
  };

  const g = (t, a, b) => t[b] || t[a] || "";

  const Nav = () => (
    <div className="bottom-nav">
      <button onClick={() => setScreen("home")}>Home</button>
      <button onClick={() => setScreen("post")}>Post</button>
      <button onClick={() => setScreen("myRequests")}>Mine</button>
      <button onClick={() => setScreen("profile")}>Profile</button>
    </div>
  );

  if (screen === "login") {
    return (
      <div className="app"><div className="phone"><section className="screen center">
        <h1 className="logo">Zolve</h1>
        <p className="tagline">Solve everyday student tasks, together.</p>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="primary" onClick={handleLogin}>Login</button>
        <p className="link" onClick={() => setScreen("signup")}>Don't have an account? Sign up</p>
      </section></div></div>
    );
  }

  if (screen === "signup") {
    return (
      <div className="app"><div className="phone"><section className="screen center">
        <h1 className="logo">Zolve</h1>
        <p className="tagline">Create your account</p>
        <input className="input" placeholder="Full Name" />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="primary" onClick={handleLogin}>Sign Up</button>
        <p className="link" onClick={() => setScreen("login")}>Already have an account? Login</p>
      </section></div></div>
    );
  }

  if (screen === "home") {
    return (
      <div className="app"><div className="phone"><section className="screen">
        <h1 className="logo">Zolve</h1>
        <p className="subtitle">Tasks near you</p>
        <div className="task-list">
          {tasks.length === 0 ? (
            <p className="empty">No tasks yet. Be the first to post one!</p>
          ) : (
            tasks.map(t => (
              <div className="task-card" key={t.id} onClick={() => { setSelectedTask(t); setScreen("detail"); }}>
                <h3>{g(t, "title", "Title")}</h3>
                <p>Location: {g(t, "location", "Location")}</p>
                <p>Urgency: {g(t, "urgency", "Urgency")}</p>
                <span className="badge open">${g(t, "price", "Price")} - {g(t, "status", "Status")}</span>
              </div>
            ))
          )}
        </div>
        <Nav />
      </section></div></div>
    );
  }

  if (screen === "post") {
    return (
      <div className="app"><div className="phone"><section className="screen">
        <div className="header"><button className="back" onClick={() => setScreen("home")}>Back</button><h2>Post a Task</h2></div>
        <input className="input" placeholder="Task title" value={task.title} onChange={e => setTask({...task, title: e.target.value})} />
        <textarea className="input" placeholder="Description" value={task.description} onChange={e => setTask({...task, description: e.target.value})} />
        <input className="input" placeholder="Location" value={task.location} onChange={e => setTask({...task, location: e.target.value})} />
        <label className="label">Price: ${task.price}</label>
        <input type="range" min="5" max="100" value={task.price} onChange={e => setTask({...task, price: parseInt(e.target.value)})} />
        <label className="label">Urgency</label>
        <select className="input" value={task.urgency} onChange={e => setTask({...task, urgency: e.target.value})}>
          <option>Today</option><option>This week</option><option>Flexible</option>
        </select>
        <button className="primary" onClick={handlePostTask}>Post Task</button>
        <Nav />
      </section></div></div>
    );
  }

  if (screen === "detail" && selectedTask) {
    return (
      <div className="app"><div className="phone"><section className="screen">
        <div className="header"><button className="back" onClick={() => setScreen("home")}>Back</button><h2>Task Details</h2></div>
        <div className="detail-card">
          <h2>{g(selectedTask, "title", "Title")}</h2>
          <p>{g(selectedTask, "description", "Description")}</p>
          <p>Location: {g(selectedTask, "location", "Location")}</p>
          <p>Urgency: {g(selectedTask, "urgency", "Urgency")}</p>
          <p>Price: ${g(selectedTask, "price", "Price")}</p>
          <p>Posted by: {selectedTask.user_email}</p>
        </div>
        {g(selectedTask, "status", "Status") === "open" && (
          <button className="primary" onClick={() => handleAccept(selectedTask.id)}>Accept Task</button>
        )}
        <Nav />
      </section></div></div>
    );
  }

  if (screen === "myRequests") {
    return (
      <div className="app"><div className="phone"><section className="screen">
        <div className="header"><button className="back" onClick={() => setScreen("home")}>Back</button><h2>My Requests</h2></div>
        <div className="task-list">
          {tasks.filter(t => t.user_email === userEmail).length === 0 ? (
            <p className="empty">No tasks posted yet.</p>
          ) : (
            tasks.filter(t => t.user_email === userEmail).map(t => (
              <div className="task-card" key={t.id}>
                <h3>{g(t, "title", "Title")}</h3>
                <p>Location: {g(t, "location", "Location")}</p>
                <span className="badge open">${g(t, "price", "Price")} - {g(t, "status", "Status")}</span>
              </div>
            ))
          )}
        </div>
        <Nav />
      </section></div></div>
    );
  }

  if (screen === "profile") {
    return (
      <div className="app"><div className="phone"><section className="screen">
        <div className="header"><button className="back" onClick={() => setScreen("home")}>Back</button><h2>Profile</h2></div>
        <div className="profile-card">
          <div className="avatar">👤</div>
          <h2>{userEmail}</h2>
          <p>Student - Zolve Member</p>
          <p>Tasks posted: {tasks.filter(t => t.user_email === userEmail).length}</p>
        </div>
        <button className="secondary" onClick={() => setScreen("login")}>Logout</button>
        <Nav />
      </section></div></div>
    );
  }

  return null;
}