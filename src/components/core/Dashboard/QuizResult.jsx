import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiconnector";
import { toast } from "react-hot-toast";
import { quizEndpoints } from "../../../services/apis";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

// Custom colors for the pie chart
const COLORS = ["#10B981", "#F87171", "#60A5FA", "#FBBF24"];

const QuizResult = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [previousResults, setPreviousResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizResults = async () => {
    if (!token) {
      toast.error("Please login to view quiz results");
      navigate("/login");
      return;
    }

    try {
      const response = await apiConnector(
        "GET",
        quizEndpoints.GET_QUIZ_RESULTS,
        null,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );

      if (response?.data?.success) {
        const results = response.data.results || [];
        const processedResults = results
          .map((result) => ({
            ...result,
            score: Math.round(
              (result.correctAnswers / result.totalQuestions) * 100
            ),
            date: new Date(result.quizDate).toLocaleDateString(),
          }))
          .sort((a, b) => new Date(a.quizDate) - new Date(b.quizDate));

        setPreviousResults(processedResults);
      } else {
        setPreviousResults([]);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to fetch quiz results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizResults();
  }, [token]);

  // Calculate overall statistics
  const totalQuizzes = previousResults.length;
  const averageScore = totalQuizzes
    ? Math.round(
        previousResults.reduce((acc, curr) => acc + curr.score, 0) /
          totalQuizzes
      )
    : 0;
  const highestScore = totalQuizzes
    ? Math.max(...previousResults.map((r) => r.score))
    : 0;

  const pieData = [
    {
      name: "Excellent (90-100%)",
      value: previousResults.filter((r) => r.score >= 90).length,
    },
    {
      name: "Good (70-89%)",
      value: previousResults.filter((r) => r.score >= 70 && r.score < 90)
        .length,
    },
    {
      name: "Average (50-69%)",
      value: previousResults.filter((r) => r.score >= 50 && r.score < 70)
        .length,
    },
    {
      name: "Needs Improvement (<50%)",
      value: previousResults.filter((r) => r.score < 50).length,
    },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 px-2 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white bg-richblack-800 px-4 py-2 rounded-lg hover:bg-richblack-700 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-center flex-grow text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500">
            Quiz Performance Analytics
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Total Quizzes",
              value: totalQuizzes,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Average Score",
              value: `${averageScore}%`,
              color: "from-green-500 to-green-600",
            },
            {
              label: "Highest Score",
              value: `${highestScore}%`,
              color: "from-yellow-500 to-yellow-600",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl shadow-lg`}
            >
              <h3 className="text-white text-lg font-semibold">{stat.label}</h3>
              <p className="text-white text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="bg-richblack-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Score Progression
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={previousResults}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    // dataKey="topic"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                    label={{
                      value: "Topic",
                      angle: 0,
                      offset: -3,
                      position: "insideBottom",
                      fill: "#9CA3AF",
                    }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF" }}
                    domain={[0, 100]}
                    label={{
                      value: "Score (%)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#9CA3AF",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                    }}
                    labelStyle={{ color: "#9CA3AF" }}
                    labelFormatter={(label, props) => {
                      const { payload } = props[0] || {};
                      return payload?.quizDate
                        ? `Date: ${new Date(
                            payload.quizDate
                          ).toLocaleDateString()}`
                        : "";
                    }}
                    formatter={(value, name, props) => {
                      const { payload } = props;
                      return [`${value}%`, `Topic: ${payload.topic}`];
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#60A5FA"
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2, fill: "#1F2937" }}
                    activeDot={{ r: 8, strokeWidth: 2 }}
                    fillOpacity={0.2}
                    fill="url(#scoreColor)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-richblack-800 rounded-xl p-2 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Performance Distribution
            </h2>
            <div className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: "#9CA3AF", strokeWidth: 1 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                    }}
                    labelStyle={{ color: "#9CA3AF" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: "#9CA3AF" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
