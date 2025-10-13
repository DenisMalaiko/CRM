import { Outlet, NavLink } from "react-router-dom";

function Panel() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="list"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
          >
            List
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Panel;