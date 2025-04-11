import { useState } from "react";

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({}); // tracks which questions have been answered

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
                  text: `Generate a quiz with 5 multiple-choice questions on the topic: "${topic}". Format each question like this:

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
    const questionBlocks = text.split(/\n(?=\d+\.)/); // split on lines starting with number + dot
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
    if (answered[qIndex]) return; // ignore if already answered

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
      <h1 className="text-xl font-bold mb-4">Generate Quiz</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter lesson topic"
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={generateQuiz}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Quiz
      </button>

      <div className="mt-6 space-y-6">
        {questions.map((q, idx) => {
          const selected = answered[idx]?.selected;
          const correct = answered[idx]?.correct;

          return (
            <div key={idx} className="p-4 border rounded-lg text-white bg-black ">
              <p className="font-semibold mb-2">{q.question}</p>
              <ul className="list-none space-y-2">
                {q.options.map((opt, i) => {
                  let bgColor = "bg-red-200";
                  if (selected !== undefined) {
                    if (i === correct) bgColor = "bg-green-100";
                    if (i === selected && selected !== correct)
                      bgColor = "bg-red-100";
                  }

                  return (
                    <li
                      key={i}
                      className={`p-2 border rounded cursor-pointer ${bgColor} hover:bg-gray-100`}
                      onClick={() => handleAnswer(idx, i)}
                    >
                      {opt}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {questions.length > 0 && (
        <div className="mt-6 text-lg font-semibold">
          Your Score: {score} / {questions.length}
        </div>
      )}
    </div>
  );
}
