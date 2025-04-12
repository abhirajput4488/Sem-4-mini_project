// import { useState } from "react";

// export default function Quiz() {
//   const [topic, setTopic] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [score, setScore] = useState(0);
//   const [answered, setAnswered] = useState({});
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const letterToIndex = (letter) => {
//     return { A: 0, B: 1, C: 2, D: 3 }[letter?.toUpperCase()] ?? -1;
//   };

//   const generateQuiz = async () => {
//     if (!isLoggedIn) {
//       alert("Please login to generate the quiz.");
//       return;
//     }

//     setScore(0);
//     setAnswered({});
//     setQuestions([]);

//     const res = await fetch(
//       'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBPfcTRI-4tU4QGOHEQB2CZ6ObnKmJCzIk',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `Generate a quiz with 10 multiple-choice questions on the topic: "${topic}". Format each question like this:

// 1. What is...?
// A. Option
// B. Option
// C. Option
// D. Option
// Answer: A`,
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const data = await res.json();
//     const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
//     const parsedQuestions = parseQuestions(responseText);
//     setQuestions(parsedQuestions);
//   };

//   const parseQuestions = (text) => {
//     const questionBlocks = text.split(/\n(?=\d+\.)/);
//     const questions = [];

//     questionBlocks.forEach((block) => {
//       const lines = block.trim().split("\n").filter(Boolean);
//       const questionLine = lines[0]?.replace(/^\d+\.\s*/, "").trim();
//       const options = lines.slice(1, 5).map((line) => line.replace(/^[A-D]\.\s*/, "").trim());
//       const answerLine = lines.find((line) => line.toLowerCase().startsWith("answer:"));
//       const answer = answerLine?.split(":")[1]?.trim().toUpperCase();

//       if (questionLine && options.length === 4 && answer) {
//         questions.push({
//           question: questionLine,
//           options,
//           answer,
//         });
//       }
//     });

//     return questions;
//   };

//   const handleAnswer = (qIndex, selectedIndex) => {
//     if (answered[qIndex]) return;

//     const correctIndex = letterToIndex(questions[qIndex].answer);
//     const isCorrect = selectedIndex === correctIndex;

//     if (isCorrect) {
//       setScore((prev) => prev + 1);
//     }

//     setAnswered((prev) => ({
//       ...prev,
//       [qIndex]: {
//         selected: selectedIndex,
//         correct: correctIndex,
//       },
//     }));
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <div className="flex justify-between mb-4 items-center">
//         <h1 className="text-xl font-bold text-white">Quiz App</h1>
//         <button
//           onClick={() => setIsLoggedIn((prev) => !prev)}
//           className={`px-4 py-2 rounded ${isLoggedIn ? "bg-red-600" : "bg-green-600"} text-white`}
//         >
//           {isLoggedIn ? "Logout" : "Login"}
//         </button>
//       </div>

//       {!isLoggedIn && (
//         <p className="text-red-400 mb-4">
//           🔒 You must be logged in to generate a quiz.
//         </p>
//       )}

//       <input
//         type="text"
//         value={topic}
//         onChange={(e) => setTopic(e.target.value)}
//         placeholder="Enter lesson topic"
//         className="border p-2 w-full mb-2"
//         disabled={!isLoggedIn}
//       />
//       <button
//         onClick={generateQuiz}
//         className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//         disabled={!isLoggedIn}
//       >
//         Get Started
//       </button>

//       <div className="mt-6 space-y-6">
//         {questions.map((q, idx) => {
//           const selected = answered[idx]?.selected;
//           const correct = answered[idx]?.correct;

//           return (
//             <div key={idx} className="p-4 border rounded-lg bg-gray-900 text-white">
//               <p className="font-semibold mb-2">
//                 {idx + 1}. {q.question}
//               </p>
//               <ul className="list-none space-y-2">
//                 {q.options.map((opt, i) => {
//                   let bgColor = "bg-gray-800";
//                   if (selected !== undefined) {
//                     if (i === correct) bgColor = "bg-green-500";
//                     if (i === selected && selected !== correct)
//                       bgColor = "bg-red-500";
//                   }

//                   const optionLabel = String.fromCharCode(65 + i); // A, B, C, D

//                   return (
//                     <li
//                       key={i}
//                       className={`p-2 border rounded cursor-pointer ${bgColor} hover:bg-gray-700 transition`}
//                       onClick={() => handleAnswer(idx, i)}
//                     >
//                       {optionLabel}. {opt}
//                     </li>
//                   );
//                 })}
//               </ul>

//               {selected !== undefined && (
//                 <p className="mt-3 text-sm">
//                   {selected === correct ? (
//                     <span className="text-green-400 font-semibold">✅ Correct!</span>
//                   ) : (
//                     <span className="text-red-400 font-semibold">
//                       ❌ Incorrect. Correct Answer:{" "}
//                       {String.fromCharCode(65 + correct)}. {q.options[correct]}
//                     </span>
//                   )}
//                 </p>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {questions.length > 0 && (
//         <div className="mt-6 text-lg font-semibold text-center text-white">
//           🧮 Your Score: <span className="text-red-400">{score}</span> / {questions.length}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});

  const letterToIndex = (letter) => {
    return { A: 0, B: 1, C: 2, D: 3 }[letter?.toUpperCase()] ?? -1;
  };

  const generateQuiz = async () => {
    setScore(0);
    setAnswered({});
    setQuestions([]);

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBPfcTRI-4tU4QGOHEQB2CZ6ObnKmJCzIk',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a quiz with 10 multiple-choice questions on the topic: "${topic}". Format each question like this:

1. What is...?
A. Option
B. Option
C. Option
D. Option
Answer: A`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsedQuestions = parseQuestions(responseText);
    setQuestions(parsedQuestions);
  };

  const parseQuestions = (text) => {
    const questionBlocks = text.split(/\n(?=\d+\.)/);
    const questions = [];

    questionBlocks.forEach((block) => {
      const lines = block.trim().split("\n").filter(Boolean);
      const questionLine = lines[0]?.replace(/^\d+\.\s*/, "").trim();
      const options = lines.slice(1, 5).map((line) => line.replace(/^[A-D]\.\s*/, "").trim());
      const answerLine = lines.find((line) => line.toLowerCase().startsWith("answer:"));
      const answer = answerLine?.split(":")[1]?.trim().toUpperCase();

      if (questionLine && options.length === 4 && answer) {
        questions.push({
          question: questionLine,
          options,
          answer,
        });
      }
    });

    return questions;
  };

  const handleAnswer = (qIndex, selectedIndex) => {
    if (answered[qIndex]) return;

    const correctIndex = letterToIndex(questions[qIndex].answer);
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswered((prev) => ({
      ...prev,
      [qIndex]: {
        selected: selectedIndex,
        correct: correctIndex,
      },
    }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-white">Generate Quiz</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter lesson topic"
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={generateQuiz}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" 
        
      >
        Get Started
      </button>

      <div className="mt-6 space-y-6">
        {questions.map((q, idx) => {
          const selected = answered[idx]?.selected;
          const correct = answered[idx]?.correct;

          return (
            <div key={idx} className="p-4 border rounded-lg bg-gray-900 text-white">
              <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
              <ul className="list-none space-y-2">
                {q.options.map((opt, i) => {
                  const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
                  let bgColor = "bg-gray-800";
                  if (selected !== undefined) {
                    if (i === correct) bgColor = "bg-green-500";
                    if (i === selected && selected !== correct)
                      bgColor = "bg-red-500";
                  }

                  return (
                    <li
                      key={i}
                      className={`p-2 border rounded cursor-pointer ${bgColor} hover:bg-gray-700 transition`}
                      onClick={() => handleAnswer(idx, i)}
                    >
                      <span className="font-semibold mr-2">{optionLetter}.</span> {opt}
                    </li>
                  );
                })}
              </ul>

              {selected !== undefined && (
                <p className="mt-3 text-sm">
                  {selected === correct ? (
                    <span className="text-green-400 font-semibold">✅ Correct!</span>
                  ) : (
                    <span className="text-red-400 font-semibold">
                      ❌ Incorrect. Correct Answer:{" "}
                      <span className="underline">
                        {String.fromCharCode(65 + correct)}. {q.options[correct]}
                      </span>
                    </span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {questions.length > 0 && (
        <div className="mt-6 text-lg font-semibold text-center text-white">
          🧮 Your Score: <span className="text-red-400">{score}</span> / {questions.length}
        </div>
      )}
    </div>
  );
}
