import React from "react";

function List() {
  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-end px-4 py-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Business
          </button>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <h3>Table</h3>
        </div>
      </div>
    </section>
  )
}

export default List;