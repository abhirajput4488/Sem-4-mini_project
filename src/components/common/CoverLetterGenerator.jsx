import { useState } from "react";

export default function CoverLetterGenerator() {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCoverLetter = async () => {
    if (!company || !jobTitle || !jobDescription) {
      alert("Please fill in all the fields to generate a cover letter.");
      return;
    }

    setLoading(true);

    try {
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Cover Letter Generator</h1>

      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Enter Company Name"
        className="border p-2 w-full mb-2"
      />

      <input
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="Enter Job Title"
        className="border p-2 w-full mb-2"
      />

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the Job Description"
        className="border p-2 w-full mb-4"
        rows="6"
      />

      <button
        onClick={generateCoverLetter}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {coverLetter && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-900 text-white whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">Generated Cover Letter</h2>
          <p>{coverLetter}</p>
        </div>
      )}
    </div>
  );
}