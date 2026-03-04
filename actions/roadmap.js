"use server";

import Groq from "groq-sdk";

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
});

export async function generateRoadmap(career){

 try{

 const prompt = `
Create a VERY DETAILED learning roadmap for becoming a ${career}.

Return ONLY JSON.

Format:

{
 "nodes":[
  {
   "id":"1",
   "title":"Step title",
   "skills":["skill1","skill2"],
   "resources":["course1","course2"],
   "projects":["project idea"]
  }
 ]
}

Rules:
- 8 to 12 steps
- each step must contain skills
- realistic career path
`;

 const res = await groq.chat.completions.create({
  model:"llama-3.1-8b-instant",
  temperature:0.4,
  messages:[
   {
    role:"system",
    content:"Return JSON only"
   },
   {
    role:"user",
    content:prompt
   }
  ]
 });

 let text = res.choices[0].message.content;

 text = text.replace(/```json|```/g,"").trim();

 const match = text.match(/\{[\s\S]*\}/);

 if(!match){
  throw new Error("Invalid JSON from AI");
 }

 const parsed = JSON.parse(match[0]);

 return {
  nodes: parsed.nodes || []
 };

 }
 catch(err){

 console.error(err);

 return { nodes:[] };

 }

}