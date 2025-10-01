function Dashboard() {
  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            + Add New
          </button>
        </div>
      </section>

      {/* Example grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Revenue</h2>
          <p className="text-2xl font-semibold mt-2">$12,340</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">New Clients</h2>
          <p className="text-2xl font-semibold mt-2">34</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold">Pending Invoices</h2>
          <p className="text-2xl font-semibold mt-2">5</p>
        </div>
      </div>
    </section>
  )
}

export default Dashboard;