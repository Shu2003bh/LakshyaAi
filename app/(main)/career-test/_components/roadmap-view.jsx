"use client";

import { useEffect, useState } from "react";
import { generateRoadmap } from "@/actions/roadmap";

export default function RoadmapView({ career }) {

const [steps, setSteps] = useState([]);

useEffect(() => {
async function load() {
try {
const data = await generateRoadmap(career);
setSteps(data.nodes || []);
} catch (err) {
console.error("Roadmap load error:", err);
}
}


if (career) load();


}, [career]);

return ( <div className="mt-10">


  <h2 className="text-3xl font-bold text-indigo-600 mb-8">
    {career} Career Roadmap
  </h2>

  <div className="relative border-l border-gray-300 pl-10 space-y-10">

    {steps.map((step, i) => (

      <div key={i} className="relative">

        <div className="absolute -left-4 top-1 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow">
          {i + 1}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">

          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            {step.title}
          </h3>

          <div className="flex flex-wrap gap-2">

            {(step.skills || []).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

      </div>

    ))}

  </div>

</div>

);
}
