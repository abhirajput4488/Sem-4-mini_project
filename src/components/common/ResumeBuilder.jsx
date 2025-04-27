import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const ResumeBuilder = () => {
  const [resume, setResume] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    github: '',
    skills: [],
    professionalSummary: '',
    achievements: '',
    certifications: '',
    languages: [],
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', position: '', years: '' }],
    projects: [{ title: '', description: '' }], // ADDED project state
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResume({ ...resume, [name]: value });
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = [...resume.education];
    updatedEducation[index][name] = value;
    setResume({ ...resume, education: updatedEducation });
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...resume.experience];
    updatedExperience[index][name] = value;
    setResume({ ...resume, experience: updatedExperience });
  };

  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProjects = [...resume.projects];
    updatedProjects[index][name] = value;
    setResume({ ...resume, projects: updatedProjects });
  };

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addEducationField = () => {
    setResume({ ...resume, education: [...resume.education, { school: '', degree: '', year: '' }] });
  };

  const removeEducationField = (index) => {
    const updatedEducation = [...resume.education];
    updatedEducation.splice(index, 1);
    setResume({ ...resume, education: updatedEducation });
  };

  const addExperienceField = () => {
    setResume({ ...resume, experience: [...resume.experience, { company: '', position: '', years: '' }] });
  };

  const removeExperienceField = (index) => {
    const updatedExperience = [...resume.experience];
    updatedExperience.splice(index, 1);
    setResume({ ...resume, experience: updatedExperience });
  };

  const addProjectField = () => {
    setResume({ ...resume, projects: [...resume.projects, { title: '', description: '' }] });
  };

  const removeProjectField = (index) => {
    const updatedProjects = [...resume.projects];
    updatedProjects.splice(index, 1);
    setResume({ ...resume, projects: updatedProjects });
  };

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      setResume({ ...resume, skills: [...resume.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = [...resume.skills];
    updatedSkills.splice(index, 1);
    setResume({ ...resume, skills: updatedSkills });
  };

  const addLanguage = () => {
    if (newLanguage.trim() !== '') {
      setResume({ ...resume, languages: [...resume.languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    const updatedLanguages = [...resume.languages];
    updatedLanguages.splice(index, 1);
    setResume({ ...resume, languages: updatedLanguages });
  };

  const handleDownload = () => {
    const element = document.getElementById('resume-preview');
    html2pdf().from(element).save('My_Resume.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-5xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 drop-shadow-lg animate-pulse">
        Resume Builder
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side - Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-8 max-w-lg mx-auto">
        <div className="bg-blue-100 text-center font-semibold py-3 rounded-lg shadow mb-4 border border-blue-300">
            Fill Your Resume Details
          </div>
          <form className="space-y-6">
            {/* Profile Photo Upload */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhoto}
                className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="fullName" value={resume.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
              <input type="email" name="email" value={resume.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
              <input type="text" name="phone" value={resume.phone} onChange={handleChange} placeholder="Phone" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
              <input type="text" name="address" value={resume.address} onChange={handleChange} placeholder="Address" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
              <input type="text" name="linkedIn" value={resume.linkedIn} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
              <input type="text" name="github" value={resume.github} onChange={handleChange} placeholder="GitHub URL" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
            </div>

            {/* Professional Summary */}
            <textarea name="professionalSummary" value={resume.professionalSummary} onChange={handleChange} placeholder="Professional Summary" rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />

            {/* Skills */}
            <div>
              <h2 className="font-semibold text-xl mt-6 mb-2">Skills</h2>
              <div className="flex gap-2">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Enter a skill" className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                <button type="button" onClick={addSkill} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-600">Add</button>
              </div>
              <div className="flex flex-wrap mt-2 gap-2">
                {resume.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                    {skill}
                    <button type="button" onClick={() => removeSkill(index)} className="text-red-500">✖</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <textarea name="achievements" value={resume.achievements} onChange={handleChange} placeholder="Achievements" rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />

            {/* Certifications */}
            <textarea name="certifications" value={resume.certifications} onChange={handleChange} placeholder="Certifications" rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />

            {/* Languages */}
            <div>
              <h2 className="font-semibold text-xl mt-6 mb-2">Languages</h2>
              <div className="flex gap-2">
                <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Enter a language" className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                <button type="button" onClick={addLanguage} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-600">Add</button>
              </div>
              <div className="flex flex-wrap mt-2 gap-2">
                {resume.languages.map((language, index) => (
                  <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                    {language}
                    <button type="button" onClick={() => removeLanguage(index)} className="text-red-500">✖</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="font-semibold text-xl mt-6">Education</h2>
              {resume.education.map((edu, index) => (
                <div key={index} className="space-y-3 mb-4">
                  <input type="text" name="school" value={edu.school} onChange={(e) => handleEducationChange(index, e)} placeholder="School" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <input type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <input type="text" name="year" value={edu.year} onChange={(e) => handleEducationChange(index, e)} placeholder="Year" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <button type="button" onClick={() => removeEducationField(index)} className="bg-pink-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-600">❌ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addEducationField} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-600">+ Add Education</button>
            </div>

            {/* Experience */}
            <div>
              <h2 className="font-semibold text-xl mt-6">Experience</h2>
              {resume.experience.map((exp, index) => (
                <div key={index} className="space-y-3 mb-4">
                  <input type="text" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} placeholder="Company" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <input type="text" name="position" value={exp.position} onChange={(e) => handleExperienceChange(index, e)} placeholder="Position" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <input type="text" name="years" value={exp.years} onChange={(e) => handleExperienceChange(index, e)} placeholder="Years" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <button type="button" onClick={() => removeExperienceField(index)} className="bg-pink-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-600">❌ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addExperienceField} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-600">+ Add Experience</button>
            </div>

            {/* Projects Section */}
            <div>
              <h2 className="font-semibold text-xl mt-6">Projects</h2>
              {resume.projects.map((proj, index) => (
                <div key={index} className="space-y-3 mb-4">
                  <input type="text" name="title" value={proj.title} onChange={(e) => handleProjectChange(index, e)} placeholder="Project Title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <textarea name="description" value={proj.description} onChange={(e) => handleProjectChange(index, e)} placeholder="Project Description" rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600" />
                  <button type="button" onClick={() => removeProjectField(index)} className="bg-pink-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-600">❌ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addProjectField} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-600">+ Add Project</button>
            </div>

            {/* Download Button */}
            <button type="button" onClick={handleDownload} className="bg-caribbeangreen-400 w-full text-black py-3 rounded-lg hover:bg-green-600 mt-6 focus:ring-2 focus:ring-green-600">
              📄 Download Resume
            </button>
          </form>
        </div>

        {/* Right Side - Resume Preview */}
        <div id="resume-preview" className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-8">
          <div className="text-center">
            {profilePhoto && (
              <img src={profilePhoto} alt="Profile" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-indigo-600" />
            )}
            <h2 className="text-4xl font-bold mb-2">{resume.fullName}</h2>
            <p className="text-gray-600">{resume.email} | {resume.phone} | {resume.address}</p>
            <p className="text-blue-500 mt-1">
              <a href={resume.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a> | <a href={resume.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>

          <div className="space-y-6">
            <Section title="Professional Summary" content={resume.professionalSummary} />
            <Section title="Skills" content={resume.skills.join(', ')} />
            <Section title="Achievements" content={resume.achievements} />
            <Section title="Certifications" content={resume.certifications} />
            <Section title="Languages" content={resume.languages.join(', ')} />
            <Section title="Education" content={resume.education.map((edu) => `${edu.degree} at ${edu.school} (${edu.year})`).join('\n')} />
            <Section title="Experience" content={resume.experience.map((exp) => `${exp.position} at ${exp.company} (${exp.years})`).join('\n')} />
            <Section title="Projects" content={resume.projects.map((proj) => `${proj.title}: ${proj.description}`).join('\n')} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, content }) => (
  <div>
    <h3 className="text-2xl font-bold text-indigo-600 mb-2 border-b-2 border-indigo-400 pb-1">{title}</h3>
    <p className="whitespace-pre-line text-gray-700">{content}</p>
  </div>
);

export default ResumeBuilder;
