import React from "react";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { CVData, TemplateStyle } from "../types";

interface CVPreviewProps {
  cvData: CVData;
  style: TemplateStyle;
}

export default function CVPreview({ cvData, style }: CVPreviewProps) {
  const { personalInfo, experience, education, projects, skills, languages, certifications } = cvData;

  // Render markdown bullet-points correctly for roles/descriptions
  const renderBullets = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    return (
      <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1 text-gray-700">
        {lines.map((line, idx) => {
          // Strip leading bullet marks if any
          const cleanLine = line.replace(/^[*\-\u2022]\s*/, "");
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  // Define Template Styling Classes
  const getThemeClasses = () => {
    switch (style) {
      case "classic":
        return {
          container: "font-serif bg-white p-8 md:p-12 border border-gray-100 rounded-2xl max-w-4xl mx-auto shadow-xs",
          header: "border-b border-gray-300 pb-5 text-center",
          name: "text-3xl font-bold text-gray-900",
          subtitle: "text-sm italic text-gray-600 mt-1",
          sectionTitle: "text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1 mb-3",
          skillTag: "bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-sm border border-gray-200",
        };
      case "tech":
        return {
          container: "font-mono bg-slate-950 text-slate-100 p-8 md:p-12 border border-slate-800 rounded-2xl max-w-4xl mx-auto shadow-xl",
          header: "border-b border-emerald-500/30 pb-5",
          name: "text-2xl font-bold tracking-tight text-emerald-400",
          subtitle: "text-xs text-emerald-500/80 mt-1",
          sectionTitle: "text-xs font-bold uppercase tracking-widest text-emerald-400 border-l-4 border-emerald-500 pl-2 mb-4",
          skillTag: "bg-slate-900 text-emerald-400 text-xs px-2.5 py-0.5 rounded-md border border-emerald-500/20",
        };
      case "creative":
        return {
          container: "font-sans bg-amber-50/20 p-8 md:p-12 border border-orange-100 rounded-2xl max-w-4xl mx-auto shadow-sm",
          header: "pb-6",
          name: "text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600",
          subtitle: "text-sm font-semibold text-rose-600 uppercase tracking-widest mt-1.5",
          sectionTitle: "text-md font-extrabold text-orange-700 tracking-wide border-b-2 border-orange-200 pb-1.5 mb-4",
          skillTag: "bg-orange-50 text-orange-700 text-xs px-2.5 py-0.5 rounded-full border border-orange-100 font-medium",
        };
      case "modern":
      default:
        return {
          container: "font-sans bg-white p-8 md:p-12 border border-gray-100 rounded-2xl max-w-4xl mx-auto shadow-md",
          header: "border-b-2 border-emerald-600 pb-6",
          name: "text-3xl font-extrabold text-gray-900 tracking-tight",
          subtitle: "text-sm font-semibold text-emerald-600 mt-1.5",
          sectionTitle: "text-sm font-bold uppercase tracking-wider text-emerald-700 border-b border-emerald-100 pb-1.5 mb-4",
          skillTag: "bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md font-medium",
        };
    }
  };

  const classes = getThemeClasses();
  const isDark = style === "tech";

  return (
    <div className={classes.container} id="printable-cv-stage">
      {/* 1. HEADER SECTION */}
      <header className={classes.header}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className={classes.name}>{personalInfo.fullName || "Your Full Name"}</h1>
            {personalInfo.summary && (
              <p className={classes.subtitle}>
                {personalInfo.summary.substring(0, 100)}...
              </p>
            )}
          </div>

          <div className={`text-xs space-y-1.5 text-right md:min-w-[200px] ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 justify-start md:justify-end">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5 justify-start md:justify-end">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5 justify-start md:justify-end">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5 justify-start md:justify-end">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`${isDark ? "text-emerald-400 hover:underline" : "text-emerald-600 hover:underline"} flex items-center gap-0.5`}
                >
                  <span>{personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Full summary description block */}
        {personalInfo.summary && (
          <p className={`mt-5 text-sm leading-relaxed text-justify ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* 2. BODY SECTION */}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Left/Main Column: Work Experience & Education */}
        <div className="md:col-span-2 space-y-8">
          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section id="cv-preview-experience">
              <h3 className={classes.sectionTitle}>Professional Experience</h3>
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.id || Math.random().toString()} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <span className={`font-bold text-sm ${isDark ? "text-slate-200" : "text-gray-900"}`}>
                        {exp.position}
                      </span>
                      <span className={`text-xs font-semibold shrink-0 ${isDark ? "text-emerald-500/80" : "text-emerald-700"}`}>
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs font-semibold text-gray-500">
                      <span className={isDark ? "text-slate-400" : "text-gray-600"}>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    <div className="mt-2 text-xs leading-relaxed">
                      {renderBullets(exp.description)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section id="cv-preview-education">
              <h3 className={classes.sectionTitle}>Education</h3>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id || Math.random().toString()} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className={`font-bold text-sm ${isDark ? "text-slate-200" : "text-gray-900"}`}>
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </span>
                      <span className={`text-xs font-semibold shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        {edu.startDate} – {edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-semibold">
                      <span className={isDark ? "text-emerald-400/80" : "text-emerald-700"}>{edu.institution}</span>
                      <span>{edu.location}</span>
                    </div>
                    {edu.description && (
                      <p className={`text-xs mt-1.5 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Skills, Projects, Certifications */}
        <div className="space-y-8">
          {/* Skills Grid */}
          {skills && skills.length > 0 && (
            <section id="cv-preview-skills">
              <h3 className={classes.sectionTitle}>Key Skills</h3>
              <div className="space-y-4">
                {skills.map((cat) => (
                  <div key={cat.id || Math.random().toString()} className="space-y-1.5">
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                      {cat.name}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((skill, idx) => (
                        <span key={idx} className={classes.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section id="cv-preview-projects">
              <h3 className={classes.sectionTitle}>Personal Projects</h3>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id || Math.random().toString()} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className={`font-bold text-sm ${isDark ? "text-slate-200" : "text-gray-900"}`}>
                        {proj.name}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {proj.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isDark ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages & Extras */}
          {((languages && languages.length > 0) || (certifications && certifications.length > 0)) && (
            <section id="cv-preview-extras" className="space-y-6">
              {/* Languages */}
              {languages && languages.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className={classes.sectionTitle}>Languages</h4>
                  <p className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    {languages.join(", ")}
                  </p>
                </div>
              )}

              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className={classes.sectionTitle}>Certifications</h4>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-gray-500">
                    {certifications.map((cert, idx) => (
                      <li key={idx} className={isDark ? "text-slate-300" : "text-gray-700"}>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
