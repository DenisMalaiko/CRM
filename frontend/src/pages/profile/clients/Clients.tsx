import React, {useState} from "react";
import CreateClientsDlg from "./createClientsDlg/CreateClientsDlg";

function Clients() {
  const [open, setOpen] = useState(false);
  const header = [
    { name: "First Name", key: "firstName" },
    { name: "Last Name", key: "lastName" },
    { name: "Email", key: "email" },
    { name: "Phone", key: "phoneNumber" },
    { name: "Address", key: "address" },
    { name: "Role", key: "role" },
    { name: "Active", key: "isActive" },
    { name: "Updated", key: "updatedAt" },
    { name: "Actions", key: "actions" }
  ];

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-end px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Add Client
          </button>

          <CreateClientsDlg
          ></CreateClientsDlg>
        </div>
      </section>

      <div className="w-full mx-auto p-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
            <tr>
              {header.map((item) => (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600" key={item.key}>{ item.name }</th>
              ))}
            </tr>
            </thead>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Clients;