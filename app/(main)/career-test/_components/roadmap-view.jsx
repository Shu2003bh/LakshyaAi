"use client";

import { useEffect, useState } from "react";
import { generateRoadmap } from "@/actions/roadmap";

export default function RoadmapView({ career }) {

 const [steps,setSteps] = useState([]);

 useEffect(()=>{

  async function load(){

   const data = await generateRoadmap(career);

   setSteps(data.nodes || []);

  }

  load();

 },[career]);

 return(

 <div className="mt-10">

  <h2 className="text-3xl font-bold text-white mb-8">
   {career} Career Roadmap
  </h2>

  <div className="relative border-l border-zinc-700 pl-10 space-y-10">

   {steps.map((step,i)=>(

    <div key={i} className="relative">

     <div className="absolute -left-4 top-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
      {i+1}
     </div>

     <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-lg hover:shadow-blue-500/20 transition">

      <h3 className="text-lg font-semibold mb-3">
       {step.title}
      </h3>

      <div className="flex flex-wrap gap-2">

       {(step.skills || []).map((skill,index)=>(
        <span
         key={index}
         className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700"
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