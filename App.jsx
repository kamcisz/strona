import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [view, setView] = useState("login");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    setRegisteredUsers(users);
  }, []);

  const handleRegister = (newUser) => {
    const users = [...registeredUsers, newUser];
    setRegisteredUsers(users);
    localStorage.setItem("users", JSON.stringify(users));
    setView("login");
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

  return (
    <div className="app">
      {!user ? (
        view === "login" ? (
          <Login onLogin={handleLogin} switchToRegister={() => setView("register")} />
        ) : (
          <Register onRegister={handleRegister} switchToLogin={() => setView("login")} />
        )
      ) : (
        <TodoList user={user} />
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
        <p onClick={switchToLogin}>Already have an account? Login</p>
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
        <p onClick={switchToRegister}>Don't have an account? Register</p>
      </form>
    </div>
  );
}

function TodoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");

  const addTask = () => {
    if (taskTitle.trim()) {
      setTasks([...tasks, { title: taskTitle, subtasks: [], done: false }]);
      setTaskTitle("");
    }
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], done: !newTasks[index].done };
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const addSubtask = (index, title) => {
    const newTasks = [...tasks];
    const updatedSubtasks = [...newTasks[index].subtasks, { title, done: false }];
    newTasks[index] = { ...newTasks[index], subtasks: updatedSubtasks };
    setTasks(newTasks);
  };

  const toggleSubtask = (taskIndex, subIndex) => {
    const newTasks = [...tasks];
    const updatedSubtasks = newTasks[taskIndex].subtasks.map((subtask, i) =>
      i === subIndex ? { ...subtask, done: !subtask.done } : subtask
    );
    newTasks[taskIndex] = { ...newTasks[taskIndex], subtasks: updatedSubtasks };
    setTasks(newTasks);
  };

  const deleteSubtask = (taskIndex, subIndex) => {
    const newTasks = [...tasks];
    const updatedSubtasks = newTasks[taskIndex].subtasks.filter((_, i) => i !== subIndex);
    newTasks[taskIndex] = { ...newTasks[taskIndex], subtasks: updatedSubtasks };
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
            <span className={task.done ? "done" : ""}>{task.title}</span>
            <button onClick={() => deleteTask(index)}>Delete</button>
          </div>
          <SubtaskList task={task} taskIndex={index} onAdd={addSubtask} onToggle={toggleSubtask} onDelete={deleteSubtask} />
        </div>
      ))}
    </div>
  );
}

function SubtaskList({ task, taskIndex, onAdd, onToggle, onDelete }) {
  const [subtaskTitle, setSubtaskTitle] = useState("");

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
          <span className={sub.done ? "done" : ""}>{sub.title}</span>
          <button onClick={() => onDelete(taskIndex, i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default App;