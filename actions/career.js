"use server";

import Groq from "groq-sdk";

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
});

export async function generateCareerSuggestions(answers){

 try{

  const prompt = `
A student answered the following interest questions:

${answers.join(", ")}

Suggest 5 suitable careers.

Return STRICT JSON in this format:

{
 "careers":[
  {
   "name":"career name",
   "description":"short description"
  }
 ]
}

Do NOT add explanation or markdown.
`;

  const res = await groq.chat.completions.create({
   model:"llama-3.1-8b-instant",
   temperature:0.4,
   messages:[
    {
     role:"system",
     content:"Return ONLY valid JSON."
    },
    {
     role:"user",
     content:prompt
    }
   ]
  });

  let text = res.choices[0].message.content;

  // remove markdown if AI adds it
  text = text.replace(/```json|```/g,"").trim();

  const parsed = JSON.parse(text);

  return parsed.careers || [];

 }
 catch(error){

  console.error("AI career suggestion error:",error);

  return [];

 }

}