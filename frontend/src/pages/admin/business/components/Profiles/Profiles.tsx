import React, { useState } from "react";

import CreateProfileDlg from "./createProfileDlg/CreateProfileDlg";

function Profiles() {
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  return (
    <section>
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Profiles</h2>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Add Profile
        </button>

        <CreateProfileDlg
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
        ></CreateProfileDlg>
      </div>
    </section>
  )
}
export default Profiles;