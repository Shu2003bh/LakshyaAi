"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles } from "lucide-react";
import { generateCareerSuggestions } from "@/actions/career";
import RoadmapView from "./roadmap-view";

export default function CareerTestForm(){

 const questions = [
  {
   question:"What type of work excites you?",
   options:["Coding","Design","Helping People","Business"]
  },
  {
   question:"Which subject do you enjoy the most?",
   options:["Math","Art","Biology","Economics"]
  },
  {
   question:"What type of problem do you like solving?",
   options:["Logical","Creative","Medical","Management"]
  },
  {
   question:"What type of environment do you prefer?",
   options:["Technology labs","Creative studios","Hospitals","Corporate offices"]
  },
  {
   question:"What motivates you the most?",
   options:["Solving problems","Creating things","Helping people","Building businesses"]
  }
 ];

 const [step,setStep] = useState(0);
 const [answers,setAnswers] = useState([]);
 const [careers,setCareers] = useState([]);
 const [loading,setLoading] = useState(false);
 const [selectedCareer,setSelectedCareer] = useState(null);

 const progress = (step / questions.length) * 100;

 const handleSelect = (option)=>{
  const newAnswers = [...answers];
  newAnswers[step] = option;
  setAnswers(newAnswers);
 };

 const handleNext = ()=>{
  if(step < questions.length-1){
   setStep(step+1);
  } else {
   handleSubmit();
  }
 };

 const handleSubmit = async()=>{
  setLoading(true);
  const res = await generateCareerSuggestions(answers);
  setCareers(res || []);
  setLoading(false);
 };

 return(

  <div className="max-w-xl mx-auto space-y-6">

   {/* ROADMAP VIEW */}

   {selectedCareer && (
    <RoadmapView career={selectedCareer}/>
   )}

   {/* CAREER RESULTS */}

   {careers.length>0 && !selectedCareer &&(

    <div className="space-y-4">

     <h2 className="text-xl font-semibold">
      Recommended Careers
     </h2>

     {careers.map((c,i)=>(

      <Card
       key={i}
       className="cursor-pointer hover:border-primary"
       onClick={()=>setSelectedCareer(c.name || c)}
      >

       <CardHeader>
        <CardTitle>
         {c.name || c}
        </CardTitle>
       </CardHeader>

       {c.description && (
        <CardContent>
         <p className="text-sm text-muted-foreground">
          {c.description}
         </p>
        </CardContent>
       )}

      </Card>

     ))}

    </div>

   )}

   {/* QUIZ */}

   {careers.length === 0 && (

    <>
     <Progress value={progress} />

     <Card>

      <CardHeader>
       <CardTitle>
        {questions[step].question}
       </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

       {questions[step].options.map((opt)=>(
        <Button
         key={opt}
         variant={answers[step]===opt ? "default" : "outline"}
         className="w-full justify-start"
         onClick={()=>handleSelect(opt)}
        >
         {opt}
        </Button>
       ))}

      </CardContent>

     </Card>

     <Button
      className="w-full"
      disabled={!answers[step] || loading}
      onClick={handleNext}
     >

      {loading ? (
       <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
        Analyzing...
       </>
      ) : step === questions.length-1 ? (
       <>
        <Sparkles className="mr-2 h-4 w-4"/>
        See My Result
       </>
      ) : (
       "Next Question"
      )}

     </Button>

    </>

   )}

  </div>

 );

}