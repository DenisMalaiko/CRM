function Clients() {
  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">Clients</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            + Add New
          </button>
        </div>
      </section>

      {/* Example grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      </div>
    </section>
  )
}

export default Clients;