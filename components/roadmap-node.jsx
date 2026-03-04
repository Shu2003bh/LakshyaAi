export default function RoadmapNode({ data }) {

 return (

  <div className="relative bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-xl p-4 w-64 shadow-lg hover:shadow-blue-500/20 transition">

   <div className="absolute -top-3 -left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
    {data.step}
   </div>

   <h3 className="font-semibold text-white mb-3">
    {data.title}
   </h3>

   <div className="flex flex-wrap gap-1">

    {(data.skills || []).map((skill,i)=>(
     <span
      key={i}
      className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-gray-300"
     >
      {skill}
     </span>
    ))}

   </div>

  </div>

 );

}