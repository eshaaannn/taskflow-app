import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "./lib/supabaseClient"
import { fetchTodos, createTodo, deleteTodo, updateTodo } from "./api"

export default function TodoPage() {
    const [user, setUser] = useState(null)
    const [todos, setTodos] = useState([])
    const [title, setTitle] = useState("")
    const navigate = useNavigate()

    const loadTodos = async () => {
        try {
            const data = await fetchTodos()
            setTodos(data || [])
        } catch {
            setTodos([])
        }
    }

    useEffect(() => {
        let active = true

        const init = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser()

            if (!active) return

            if (!currentUser) {
                navigate("/login")
                return
            }

            setUser(currentUser)

            try {
                const data = await fetchTodos()
                if (active) {
                    setTodos(data || [])
                }
            } catch {
                if (active) {
                    setTodos([])
                }
            }
        }

        init()

        return () => {
            active = false
        }
    }, [navigate])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        await createTodo(title.trim())
        setTitle("")
        await loadTodos()
    }

    const handleToggle = async (todo) => {
        await updateTodo(todo.id, { completed: !todo.completed })
        await loadTodos()
    }

    const handleDelete = async (id) => {
        await deleteTodo(id)
        await loadTodos()
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    if (!user) return null

    const completedCount = todos.filter((t) => t.completed).length
    const totalCount = todos.length

    return (
        <div className="dashboard">
            <div className="dashboard-inner">
                <div className="dash-header">
                    <div className="dash-header-left">
                        <h1>TaskFlow</h1>
                        <p>{user.email}</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>

                <form className="add-todo" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button type="submit" className="add-btn" title="Add task">
                        Add
                    </button>
                </form>

                {totalCount > 0 && (
                    <div className="stats-bar">
                        <div className="stat-chip">
                            Total <span>{totalCount}</span>
                        </div>
                        <div className="stat-chip done">
                            Done <span>{completedCount}</span>
                        </div>
                    </div>
                )}

                {totalCount === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon" aria-hidden="true">[]</div>
                        <p>No tasks yet</p>
                        <p>Add your first task to get momentum.</p>
                    </div>
                ) : (
                    <div className="todo-list">
                        {todos.map((todo, index) => (
                            <div
                                key={todo.id}
                                className="todo-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <button
                                    className={`todo-check ${todo.completed ? "checked" : ""}`}
                                    onClick={() => handleToggle(todo)}
                                    title={todo.completed ? "Mark incomplete" : "Mark complete"}
                                >
                                    {todo.completed ? "✓" : ""}
                                </button>
                                <span className={`todo-text ${todo.completed ? "completed" : ""}`}>
                                    {todo.title}
                                </span>
                                <button
                                    className="todo-delete"
                                    onClick={() => handleDelete(todo.id)}
                                    title="Delete task"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
