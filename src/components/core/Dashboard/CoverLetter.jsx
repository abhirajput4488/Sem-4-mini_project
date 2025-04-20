import { useState } from "react";

export default function CoverLetterGenerator() {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCoverLetter = async () => {
    if (!company || !jobTitle || !jobDescription) {
      alert("Please fill in all the fields to generate a cover letter.");
      return;
    }

    setLoading(true);
    setCopied(false);

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBPfcTRI-4tU4QGOHEQB2CZ6ObnKmJCzIk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
Generate a professional, polished, and well-formatted cover letter for a job application.

Details:
Company: ${company}
Job Title: ${jobTitle}
Job Description: ${jobDescription}

Guidelines:
- Use a formal and confident tone.
- Start with a proper header and a greeting.
- First paragraph: introduce the candidate and express enthusiasm for the role.
- Second: highlight relevant technical skills and past experience.
- Third: connect the candidate's strengths to the company's goals or job description.
- Final: close politely with interest in interview and thank them.

Ensure the structure is realistic and formatted cleanly. Include paragraph breaks and appropriate closings like "Sincerely". Use natural language that sounds like a real job application.`
                  }
                ]
              }
            ]
          }),
        }
      );

      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate a cover letter. Please try again.";
      setCoverLetter(responseText);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setCoverLetter("An error occurred while generating the cover letter. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 drop-shadow-lg animate-pulse">
          ✍️ AI Cover Letter Generator
        </h1>

        <div className="space-y-6">
          {/* Company */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google"
              className="w-full p-3 rounded-lg bg-slate-800 text-black border border-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full p-3 rounded-lg bg-slate-800 text-black border border-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows="6"
              className="w-full p-3 rounded-lg bg-slate-800 text-black border border-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCoverLetter}
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition-all duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105"
            }`}
          >
            {loading ? "⏳ Generating..." : "🚀 Generate Cover Letter"}
          </button>
        </div>

        {/* Output */}
        {coverLetter && (
          <div className="mt-8 bg-white/5 border border-white/20 p-6 rounded-xl text-white whitespace-pre-wrap font-light leading-relaxed shadow-md relative">
            <h2 className="text-xl font-semibold text-green-300 mb-4">📄 Your Cover Letter</h2>
            <p>{coverLetter}</p>

            <div className="mt-4 text-right">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-white text-sm font-semibold"
              >
                📋 {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}