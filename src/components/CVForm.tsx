import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase, GraduationCap, FolderCode, Wrench, Globe, Award, User } from "lucide-react";
import { CVData, Experience, Education, Project, SkillCategory } from "../types";

interface CVFormProps {
  cvData: CVData;
  onChange: (newData: CVData) => void;
}

export default function CVForm({ cvData, onChange }: CVFormProps) {
  const [activeSection, setActiveSection] = useState<string>("personal");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  // Helper to update specific sub-object state
  const updatePersonalInfo = (fields: Partial<CVData["personalInfo"]>) => {
    onChange({
      ...cvData,
      personalInfo: { ...cvData.personalInfo, ...fields },
    });
  };

  // Helper to update list states
  const updateExperience = (index: number, fields: Partial<Experience>) => {
    const updated = [...cvData.experience];
    updated[index] = { ...updated[index], ...fields };
    onChange({ ...cvData, experience: updated });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onChange({ ...cvData, experience: [...cvData.experience, newExp] });
  };

  const removeExperience = (index: number) => {
    const updated = cvData.experience.filter((_, i) => i !== index);
    onChange({ ...cvData, experience: updated });
  };

  const updateEducation = (index: number, fields: Partial<Education>) => {
    const updated = [...cvData.education];
    updated[index] = { ...updated[index], ...fields };
    onChange({ ...cvData, education: updated });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onChange({ ...cvData, education: [...cvData.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    const updated = cvData.education.filter((_, i) => i !== index);
    onChange({ ...cvData, education: updated });
  };

  const updateProject = (index: number, fields: Partial<Project>) => {
    const updated = [...cvData.projects];
    updated[index] = { ...updated[index], ...fields };
    onChange({ ...cvData, projects: updated });
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      description: "",
      technologies: [],
      link: "",
    };
    onChange({ ...cvData, projects: [...cvData.projects, newProj] });
  };

  const removeProject = (index: number) => {
    const updated = cvData.projects.filter((_, i) => i !== index);
    onChange({ ...cvData, projects: updated });
  };

  // Skill tag handlers
  const updateSkillCategoryName = (catIndex: number, newName: string) => {
    const updated = [...cvData.skills];
    updated[catIndex].name = newName;
    onChange({ ...cvData, skills: updated });
  };

  const addSkillTag = (catIndex: number, tagText: string) => {
    if (!tagText.trim()) return;
    const updated = [...cvData.skills];
    if (!updated[catIndex].skills.includes(tagText.trim())) {
      updated[catIndex].skills.push(tagText.trim());
      onChange({ ...cvData, skills: updated });
    }
  };

  const removeSkillTag = (catIndex: number, tagIndex: number) => {
    const updated = [...cvData.skills];
    updated[catIndex].skills = updated[catIndex].skills.filter((_, i) => i !== tagIndex);
    onChange({ ...cvData, skills: updated });
  };

  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      name: "New Category",
      skills: [],
    };
    onChange({ ...cvData, skills: [...cvData.skills, newCat] });
  };

  const removeSkillCategory = (catIndex: number) => {
    const updated = cvData.skills.filter((_, i) => i !== catIndex);
    onChange({ ...cvData, skills: updated });
  };

  // Extras list helpers (Languages & Certifications)
  const addExtraItem = (field: "languages" | "certifications", value: string) => {
    if (!value.trim()) return;
    onChange({
      ...cvData,
      [field]: [...(cvData[field] || []), value.trim()],
    });
  };

  const removeExtraItem = (field: "languages" | "certifications", index: number) => {
    const updated = (cvData[field] || []).filter((_, i) => i !== index);
    onChange({
      ...cvData,
      [field]: updated,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. PERSONAL DETAILS */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("personal")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-personal"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-500" />
            <span>Personal Information</span>
          </div>
          {activeSection === "personal" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "personal" && (
          <div className="p-5 border-t border-gray-100 grid md:grid-cols-2 gap-4" id="section-personal-content">
            <div className="md:col-span-2">
              <label htmlFor="input-fullName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                id="input-fullName"
                type="text"
                value={cvData.personalInfo?.fullName || ""}
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="input-email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                id="input-email"
                type="email"
                value={cvData.personalInfo?.email || ""}
                onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                placeholder="johndoe@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="input-phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                id="input-phone"
                type="tel"
                value={cvData.personalInfo?.phone || ""}
                onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="input-location" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <input
                id="input-location"
                type="text"
                value={cvData.personalInfo?.location || ""}
                onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                placeholder="New York, NY"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="input-website" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Website / Portfolio / LinkedIn</label>
              <input
                id="input-website"
                type="url"
                value={cvData.personalInfo?.website || ""}
                onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                placeholder="https://johndoe.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="input-summary" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Professional Summary</label>
              <textarea
                id="input-summary"
                rows={4}
                value={cvData.personalInfo?.summary || ""}
                onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
                placeholder="Brief summary of your professional background, skills, and ambitions..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("experience")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-experience"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <span>Work Experience ({cvData.experience?.length || 0})</span>
          </div>
          {activeSection === "experience" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "experience" && (
          <div className="p-5 border-t border-gray-100 space-y-6" id="section-experience-content">
            {cvData.experience?.map((exp, idx) => (
              <div key={exp.id} className="relative border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-4">
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, { company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Position / Title</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(idx, { position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => updateExperience(idx, { location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g., Jun 2022"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, { startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g., Present"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => updateExperience(idx, { endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`exp-current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateExperience(idx, {
                        current: isChecked,
                        endDate: isChecked ? "Present" : "",
                      });
                    }}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor={`exp-current-${exp.id}`} className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                    Currently work here
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Role Description (Use markdown or separate bullet points with newlines)
                  </label>
                  <textarea
                    rows={4}
                    value={exp.description}
                    onChange={(e) => updateExperience(idx, { description: e.target.value })}
                    placeholder="- Developed responsive front-ends...\n- Managed continuous pipelines..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none font-sans"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="w-full py-2.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. EDUCATION */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("education")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-education"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
            <span>Education ({cvData.education?.length || 0})</span>
          </div>
          {activeSection === "education" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "education" && (
          <div className="p-5 border-t border-gray-100 space-y-6" id="section-education-content">
            {cvData.education?.map((edu, idx) => (
              <div key={edu.id} className="relative border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-4">
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, { institution: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Degree</label>
                    <input
                      type="text"
                      placeholder="e.g., B.S."
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, { degree: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Field of Study</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(idx, { fieldOfStudy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(idx, { startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Graduation Date</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        disabled={edu.current}
                        onChange={(e) => updateEducation(idx, { endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`edu-current-${edu.id}`}
                    checked={edu.current}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      updateEducation(idx, {
                        current: isChecked,
                        endDate: isChecked ? "Present" : "",
                      });
                    }}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor={`edu-current-${edu.id}`} className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                    Currently studying here
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEducation}
              className="w-full py-2.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. PROJECTS */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("projects")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-projects"
        >
          <div className="flex items-center gap-3">
            <FolderCode className="w-5 h-5 text-emerald-500" />
            <span>Projects ({cvData.projects?.length || 0})</span>
          </div>
          {activeSection === "projects" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "projects" && (
          <div className="p-5 border-t border-gray-100 space-y-6" id="section-projects-content">
            {cvData.projects?.map((proj, idx) => (
              <div key={proj.id} className="relative border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-4">
                <button
                  type="button"
                  onClick={() => removeProject(idx)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(idx, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Project Link / URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={proj.link || ""}
                      onChange={(e) => updateProject(idx, { link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Technologies used (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, AWS"
                      value={proj.technologies?.join(", ") || ""}
                      onChange={(e) =>
                        updateProject(idx, {
                          technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Project Description</label>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => updateProject(idx, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addProject}
              className="w-full py-2.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. SKILLS */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("skills")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-skills"
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-emerald-500" />
            <span>Skills & Proficiencies ({cvData.skills?.length || 0})</span>
          </div>
          {activeSection === "skills" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "skills" && (
          <div className="p-5 border-t border-gray-100 space-y-6" id="section-skills-content">
            {cvData.skills?.map((cat, catIdx) => (
              <div key={cat.id} className="relative border border-gray-100 rounded-lg p-4 bg-gray-50/30 space-y-3">
                <button
                  type="button"
                  onClick={() => removeSkillCategory(catIdx)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="max-w-md">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateSkillCategoryName(catIdx, e.target.value)}
                    placeholder="e.g., Programming Languages"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Skills Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[30px] p-2 bg-white border border-gray-200 rounded-lg">
                    {cat.skills.map((skill, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillTag(catIdx, tagIdx)}
                          className="hover:text-rose-600 font-bold focus:outline-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {cat.skills.length === 0 && <span className="text-xs text-gray-400 self-center">No tags added yet.</span>}
                  </div>

                  {/* Add tag inline */}
                  <input
                    type="text"
                    placeholder="Type skill (e.g., Python) and press Enter to add"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value;
                        addSkillTag(catIdx, val);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="w-full max-w-sm px-3 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSkillCategory}
              className="w-full py-2.5 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill Category</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. EXTRAS (LANGUAGES & CERTIFICATIONS) */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("extras")}
          className="w-full px-5 py-4 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50/50 cursor-pointer text-left"
          id="section-toggle-extras"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-500" />
            <span>Languages & Certifications</span>
          </div>
          {activeSection === "extras" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {activeSection === "extras" && (
          <div className="p-5 border-t border-gray-100 grid md:grid-cols-2 gap-6" id="section-extras-content">
            {/* Languages */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Languages</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-gray-50/50 border border-gray-200 rounded-lg">
                {cvData.languages?.map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => removeExtraItem("languages", idx)}
                      className="hover:text-rose-600 focus:outline-none cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add language (e.g., German) + Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtraItem("languages", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500" />
                <span>Certifications</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-gray-50/50 border border-gray-200 rounded-lg">
                {cvData.certifications?.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeExtraItem("certifications", idx)}
                      className="hover:text-rose-600 focus:outline-none cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add certification (e.g., AWS Cloud) + Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtraItem("certifications", e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
