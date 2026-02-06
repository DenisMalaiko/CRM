import { Outlet, NavLink } from "react-router-dom";

function Profile() {
  return (
    <div className="flex wrapper bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64">
        <nav className="w-64 flex-1 px-4 py-6 space-y-2 bg-white shadow-md fixed inset-y-0 left-0 pt-20">
          <NavLink
            to="businesses"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
          >
            Businesses
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto h-max bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}

export default Profile;