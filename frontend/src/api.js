import { supabase } from './lib/supabaseClient'

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "")

async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
        throw new Error("Not authenticated. Please login again.")
    }
    return session.access_token
}

async function request(path, options = {}) {
    const token = await getToken()

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
        throw new Error(data?.detail || `Request failed with status ${res.status}`)
    }

    return data
}

export async function fetchTodos() {
    return request("/todos")
}

export async function createTodo(title) {
    return request("/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    })
}

export async function updateTodo(id, data) {
    return request(`/todos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
}

export async function deleteTodo(id) {
    return request(`/todos/${id}`, {
        method: "DELETE"
    })
}
