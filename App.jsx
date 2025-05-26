import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [registerView, setRegisterView] = useState("login");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    setRegisteredUsers(users);
  }, []);

  const handleRegister = (newUser) => {
    const users = [...registeredUsers, newUser];
    setRegisteredUsers(users);
    localStorage.setItem("users", JSON.stringify(users));
    setRegisterView("login");
  };

  const handleLogin = (credentials) => {
    const found = registeredUsers.find(
      (user) =>
        user.username === credentials.username &&
        user.password === credentials.password
    );
    if (found) setUser(found);
    else alert("Invalid credentials");
  };

  const handleLogout = () => {
    setUser(null);
    setRegisterView("login");
  };

  return (
    <div className="app">
      {!user ? (
        registerView === "login" ? (
          <Login onLogin={handleLogin} switchToRegister={() => setRegisterView("register")} />
        ) : (
          <Register onRegister={handleRegister} switchToLogin={() => setRegisterView("login")} />
        )
      ) : (
        <>
          <Profile user={user} onLogout={handleLogout} />
          <TodoList user={user} />
        </>
      )}
    </div>
  );
}

function Register({ onRegister, switchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=])[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert("Password must be 8+ chars, include uppercase, lowercase, digit, and special char");
      return;
    }
    onRegister({ username, password });
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
        <p>Already have an account? <span className="auth-link" onClick={switchToLogin}>Login</span></p>
      </form>
    </div>
  );
}

function Login({ onLogin, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        <p>Don't have an account? <span className="auth-link" onClick={switchToRegister}>Register</span></p>
      </form>
    </div>
  );
}

function Profile({ user, onLogout }) {
  return (
    <div className="profile">
      <h3>User Profile</h3>
      <p><strong>Username:</strong> {user.username}</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

function TodoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const addTask = () => {
    if (taskTitle.trim()) {
      setTasks([...tasks, { title: taskTitle, subtasks: [], done: false }]);
      setTaskTitle("");
    }
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    if (editingTask === index) setEditingTask(null);
  };

  const editTaskTitle = (index, newTitle) => {
    const newTasks = [...tasks];
    newTasks[index].title = newTitle;
    setTasks(newTasks);
  };

  const addSubtask = (index, title) => {
    const newTasks = [...tasks];
    newTasks[index].subtasks.push({ title, done: false });
    setTasks(newTasks);
  };

  const toggleSubtask = (taskIndex, subIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subtasks[subIndex].done = !newTasks[taskIndex].subtasks[subIndex].done;
    setTasks(newTasks);
  };

  const deleteSubtask = (taskIndex, subIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subtasks = newTasks[taskIndex].subtasks.filter((_, i) => i !== subIndex);
    setTasks(newTasks);
  };

  const editSubtaskTitle = (taskIndex, subIndex, newTitle) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subtasks[subIndex].title = newTitle;
    setTasks(newTasks);
  };

  return (
    <div className="todo-container">
      <h2>Welcome, {user.username}</h2>
      <div className="todo-input">
        <input
          type="text"
          placeholder="New task"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      {tasks.map((task, index) => (
        <div className="task" key={index}>
          <div className="task-header">
            <input type="checkbox" checked={task.done} onChange={() => toggleTask(index)} />
            {editingTask === index ? (
              <input
                key={`task-${index}`}
                type="text"
                value={task.title}
                onChange={(e) => editTaskTitle(index, e.target.value)}
                onBlur={() => setEditingTask(null)}
                autoFocus
                className="task-input"
              />
            ) : (
              <span className={`task-title ${task.done ? "done" : ""}`} onClick={() => setEditingTask(index)}>
                {task.title}
              </span>
            )}
            <button onClick={() => setEditingTask(index)}>Edit</button>
            <button onClick={() => deleteTask(index)}>Delete</button>
          </div>
          <SubtaskList
            task={task}
            taskIndex={index}
            onAdd={addSubtask}
            onToggle={toggleSubtask}
            onDelete={deleteSubtask}
            onEdit={editSubtaskTitle}
          />
        </div>
      ))}
    </div>
  );
}

function SubtaskList({ task, taskIndex, onAdd, onToggle, onDelete, onEdit }) {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [editingSubtask, setEditingSubtask] = useState(null);

  const handleAdd = () => {
    if (subtaskTitle.trim()) {
      onAdd(taskIndex, subtaskTitle);
      setSubtaskTitle("");
    }
  };

  return (
    <div className="subtask-list">
      <input
        type="text"
        placeholder="New subtask"
        value={subtaskTitle}
        onChange={(e) => setSubtaskTitle(e.target.value)}
      />
      <button onClick={handleAdd}>Add Subtask</button>
      {task.subtasks.map((sub, i) => (
        <div className="subtask" key={i}>
          <input type="checkbox" checked={sub.done} onChange={() => onToggle(taskIndex, i)} />
          {editingSubtask === i ? (
            <input
              key={`subtask-${taskIndex}-${i}`}
              type="text"
              value={sub.title}
              onChange={(e) => onEdit(taskIndex, i, e.target.value)}
              onBlur={() => setEditingSubtask(null)}
              autoFocus
              className="subtask-input"
            />
          ) : (
            <span className={`subtask-title ${sub.done ? "done" : ""}`} onClick={() => setEditingSubtask(i)}>
              {sub.title}
            </span>
          )}
          <button onClick={() => setEditingSubtask(i)}>Edit</button>
          <button onClick={() => onDelete(taskIndex, i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default App;