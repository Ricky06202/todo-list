import { useState, useEffect } from 'react';
import '../styles/global.css';

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
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed }),
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
        return <p className="py-8 text-center text-gray-500">Loading todos...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Todo List</h1>

            <form
                onSubmit={handleSubmit}
                className="flex gap-2 mb-8"
            >
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Add
                </button>
            </form>

            {error && (
                <p className="mb-4 p-3 text-center text-red-600 bg-red-50 rounded-md">
                    {error}
                </p>
            )}

            <ul className="space-y-3">
                {todos.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">No tasks yet. Add one above!</p>
                ) : (
                    todos.map((todo) => (
                        <li
                            key={todo.id}
                            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span
                                className={`ml-3 flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                            >
                                {todo.text}
                            </span>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                aria-label="Delete todo"
                                className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}