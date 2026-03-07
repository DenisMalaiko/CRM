import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

// Redux
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../../../store/hooks";

function Stories() {
  const dispatch = useAppDispatch();
  const { businessId } = useParams<{ businessId: string }>();

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <section>
        <section>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg text-left font-semibold text-slate-800">Stories</h2>
          </div>
        </section>
      </section>
    </div>
  )
}

export default Stories;