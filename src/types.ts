export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  languages: string[];
  certifications: string[];
}

export interface TailoringAnalysis {
  matchScore: number;
  keywordsMatched: string[];
  keywordsMissing: string[];
  summaryOfChanges: string;
  interviewTips: string[];
}

export interface TailoredCVResult {
  tailoredCV: CVData;
  analysis: TailoringAnalysis;
}

export type TemplateStyle = 'classic' | 'modern' | 'tech' | 'creative';
