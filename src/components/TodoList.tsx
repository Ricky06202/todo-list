import { useState, useEffect } from 'react';
import styles from './TodoList.module.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const API_BASE_URL = 'https://todolistapi.rsanjur.com/api';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, completed: false }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      await fetchTodos();
      setNewTodo('');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      await fetchTodos();
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      await fetchTodos();
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo(newTodo.trim());
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (isLoading) {
    return <p className="empty-state">Loading todos...</p>;
  }

  return (
  <div className={styles.container}>
    <h1 className={styles.title}>Todo List</h1>
    <form className={styles.todoForm} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.todoInput}
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new task..."
        required
      />
      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
        Add
      </button>
    </form>

    {error && <p className={styles.errorMessage}>{error}</p>}

    <ul className={styles.todoList}>
      {todos.length === 0 ? (
        <p className={styles.emptyState}>No tasks yet. Add one above!</p>
      ) : (
        todos.map((todo) => (
          <li key={todo.id} className={styles.todoItem}>
            <input
              type="checkbox"
              className={styles.todoCheckbox}
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={`${styles.todoText} ${todo.completed ? styles.completed : ''}`}>
              {todo.text}
            </span>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteTodo(todo.id)}
              aria-label="Delete todo"
            >
              &times;
            </button>
          </li>
        ))
      )}
    </ul>
  </div>
);
}