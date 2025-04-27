import { useState,useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiConnector } from "../../../services/apiconnector";


export default function Quiz() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [numQuestions, setNumQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);


  const letterToIndex = (letter) => {
    return { A: 0, B: 1, C: 2, D: 3 }[letter?.toUpperCase()] ?? -1;
  };

  
  // Function to check authentication
  const checkAuth = () => {
    if (!token || !user) {
      toast.error("Please login to save quiz results");
      navigate("/login");
      return false;
    }
    return true;
  };

  // Reset quiz states
  const resetQuizStates = () => {
    setTopic('');
    setDifficulty('easy');
    setNumQuestions(5);
    setQuestions([]);
    setScore(0);
    setAnswered({});
    setCurrentQ(0);
    setShowExplanation(false);
    setSelectedOption(null);
    setIsQuizCompleted(false);
    setLoading(false);
  };

  // Save quiz result to backend
  const saveQuizResult = async () => {
    if (!checkAuth()) return;
  
    try {
      console.log("Saving quiz with data:", {
        topic,
        totalQuestions: questions.length,
        correctAnswers: score,
        wrongAnswers: questions.length - score,
      });
  
      const response = await apiConnector(
        "POST",
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/v1/quiz/save`,
        {
          topic: topic,
          totalQuestions: questions.length,
          correctAnswers: score,
          wrongAnswers: questions.length - score,
        },
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );
  
      console.log("Save quiz response:", response);
  
      if (response?.data?.success) {
        toast.success("Quiz result saved successfully!");
        console.log("✅ Quiz results saved successfully");
      } else {
        throw new Error(response?.data?.message || "Failed to save quiz result");
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  

  // Effect to save quiz results
  useEffect(() => {
    const allQuestionsAnswered = questions.length > 0 && Object.keys(answered).length === questions.length;
    
    if (allQuestionsAnswered && !isQuizCompleted) {
      console.log("All questions answered, saving result...");
      setIsQuizCompleted(true);
      saveQuizResult();
    }
  }, [answered, questions.length, isQuizCompleted]);


  // Generate quiz
  const generateQuiz = async () => {
    if (!topic || numQuestions < 1 || numQuestions > 50) {
      toast.error("Enter a topic and number of questions between 1 and 50.");
      return;
    }

    // Reset states before generating new quiz
    setScore(0);
    setAnswered({});
    setQuestions([]);
    setCurrentQ(0);
    setShowExplanation(false);
    setSelectedOption(null);
    setIsQuizCompleted(false);
    setLoading(true);

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBPfcTRI-4tU4QGOHEQB2CZ6ObnKmJCzIk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a ${difficulty} quiz with ${numQuestions} multiple-choice questions on the topic: "${topic}". Each question must include:
- A clear question
- Four options (A-D)
- One correct answer
- An explanation

Format strictly like:
1. Question?
A. Option
B. Option
C. Option
D. Option
Answer: B
Explanation: Because...`
              }]
            }]
          })
        }
      );

      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsedQuestions = parseQuestions(responseText);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (text) => {
    const blocks = text.split(/\n(?=\d+\.)/);
    return blocks.map((block) => {
      const lines = block.trim().split("\n").filter(Boolean);
      const questionLine = lines[0]?.replace(/^\d+\.\s*/, "").trim();
      const options = lines.slice(1, 5).map((line) => line.replace(/^[A-D]\.\s*/, "").trim());
      const answerLine = lines.find((line) => line.toLowerCase().startsWith("answer:"));
      const explanationLine = lines.find((line) => line.toLowerCase().startsWith("explanation:"));
      const answer = answerLine?.split(":")[1]?.trim().toUpperCase();
      const explanation = explanationLine?.split(":")[1]?.trim() || "No explanation provided.";

      return {
        question: questionLine,
        options,
        answer,
        explanation,
      };
    }).filter(q => q.question && q.options?.length === 4 && q.answer);
  };

  const submitAnswer = () => {
    if (answered[currentQ] || selectedOption === null) return;
    const correctIndex = letterToIndex(questions[currentQ].answer);
    const isCorrect = selectedOption === correctIndex;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswered(prev => ({
      ...prev,
      [currentQ]: { selected: selectedOption, correct: correctIndex, isCorrect }
    }));
    setShowExplanation(false);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setCurrentQ(prev => prev + 1);
    setSelectedOption(null);
  };

  const restartQuiz = () => {
    resetQuizStates();
    toast.success("Quiz reset! Ready for a new topic.");
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

  const correctAnswers = Object.values(answered).filter((a) => a.selected === a.correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 drop-shadow-lg animate-pulse">
          ✨ Smart Quiz App
        </h1>

        {questions.length > 0 && (
          <div className="w-full mb-4">
            <div className="h-2 bg-gray-800 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentQ / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {questions.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-xl space-y-4 animate-fade-in">
            <div>
              <label className="block mb-1 font-semibold text-white">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Space, Python"
                className="w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-white">Number of Questions</label>
              <input
                type="number"
                min={1}
                max={50}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-white">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-4">
              <button
                onClick={generateQuiz}
                disabled={loading}
                className={`w-full text-white font-bold py-3 rounded-lg transition-all duration-300 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105"
                }`}
              >
                {loading ? "⏳ Generating Quiz..." : "🚀 Start Quiz"}
              </button>

              <button
                onClick={() => navigate("/dashboard/quiz-results")}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
              >
                📊 View Quiz Performance
              </button>
            </div>
          </div>
        )}

        {questions.length > 0 && currentQ < questions.length && (
          <div className="bg-white/10 backdrop-blur-lg p-6 mt-6 rounded-xl shadow-lg space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold">{currentQ + 1}. {questions[currentQ].question}</h2>
            <ul className="space-y-3">
              {questions[currentQ].options.map((opt, i) => {
                const selected = answered[currentQ]?.selected;
                const correct = answered[currentQ]?.correct;
                let style = "bg-gray-800 border-gray-700 hover:bg-gray-700";
                if (selected !== undefined) {
                  if (i === correct) style = "bg-green-600 border-green-400";
                  if (i === selected && selected !== correct) style = "bg-red-600 border-red-400";
                } else if (i === selectedOption) {
                  style = "bg-blue-600 border-blue-400";
                }

                return (
                  <li
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${style}`}
                    onClick={() => setSelectedOption(i)}
                  >
                    <input type="checkbox" checked={selectedOption === i} readOnly className="w-5 h-5" />
                    <span><strong>{String.fromCharCode(65 + i)}.</strong> {opt}</span>
                  </li>
                );
              })}
            </ul>

            {!answered[currentQ] && (
              <button
                onClick={submitAnswer}
                className="mt-4 bg-yellow-400 text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
              >
                ✅ Submit Answer
              </button>
            )}

            {answered[currentQ] && (
              <div className="space-y-4 mt-6">
                <p className={`text-xl font-bold ${answered[currentQ].isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {answered[currentQ].isCorrect ? "✅ Correct Answer!" : "❌ Incorrect!"}
                </p>
                {!answered[currentQ].isCorrect && (
                  <p className="text-white">
                    <strong>✔️ Correct Option:</strong> {String.fromCharCode(65 + answered[currentQ].correct)}. {questions[currentQ].options[answered[currentQ].correct]}
                  </p>
                )}
                {!showExplanation ? (
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    🔍 Show Explanation
                  </button>
                ) : (
                  <div className="bg-white/10 p-4 rounded-lg border border-pink-400 mt-2 text-white">
                    <p><strong>🧠 Explanation:</strong> {questions[currentQ].explanation}</p>
                  </div>
                )}
                <button
                  onClick={nextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-2 rounded-lg"
                >
                  ➡️ Next Question
                </button>
              </div>
            )}
          </div>
        )}

        {questions.length > 0 && currentQ === questions.length && (
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 backdrop-blur-lg rounded-xl shadow-2xl space-y-6 animate-zoom-in">
            <h2 className="text-4xl font-extrabold text-white tracking-wide">🎉 Quiz Completed!</h2>
            <p className="text-xl text-white/80">📚 Topic: <strong className="text-white">{topic}</strong></p>
            <p className="text-xl text-white/80">📈 Difficulty: <strong className="text-white">{difficulty}</strong></p>
            <p className="text-xl text-white/80">✅ Correct Answers: <strong className="text-green-400">{correctAnswers} / {questions.length}</strong></p>
            <p className="text-xl font-semibold text-yellow-300">🎯 Your Score: <strong>{score} / {questions.length}</strong></p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={restartQuiz}
                className="bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-yellow-500"
              >
                🔁 Restart Quiz
              </button>
              
              <button
                onClick={() => navigate("/dashboard/quiz-results")}
                className="bg-emerald-400 text-black font-semibold px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-emerald-500"
              >
                📊 Quiz Performance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}