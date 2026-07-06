import { CVData } from "./types";

export const initialCV: CVData = {
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    summary: "Dynamic, detail-oriented Full-Stack Engineer with over 4 years of experience building secure, scalable cloud applications. Proven track record of optimizing system response times, implementing responsive modern frontends, and collaborating with cross-functional teams to deliver high-quality software solutions.",
  },
  experience: [
    {
      id: "exp-1",
      company: "InnovateTech Solutions",
      position: "Software Engineer II",
      location: "San Francisco, CA",
      startDate: "Jun 2022",
      endDate: "Present",
      current: true,
      description: "- Engineered scalable microservices using Node.js, Express, and PostgreSQL, increasing endpoint throughput by 35%.\n- Developed pixel-perfect responsive user interfaces in React, Tailwind CSS, and TypeScript, improving web engagement by 18%.\n- Set up robust CI/CD pipelines with GitHub Actions, reducing manual deployment overhead by 12 hours weekly.\n- Collaborated with product designers and QA engineers to refine agile specifications, shipping high-impact core features ahead of deadlines."
    },
    {
      id: "exp-2",
      company: "Launchpad Systems",
      position: "Junior Web Developer",
      location: "Austin, TX",
      startDate: "Jan 2021",
      endDate: "May 2022",
      current: false,
      description: "- Authored clean, standard-compliant HTML/CSS and JavaScript for diverse high-traffic client websites.\n- Integrated RESTful APIs and optimized database queries, lowering dashboard load times by 40%.\n- Participated in weekly code reviews and sprint planning, ensuring high standards of codebase quality and test coverage.\n- Assisted in migrating a legacy multi-page application to a modern SPA structure using React."
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University of California",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      location: "Berkeley, CA",
      startDate: "Sep 2017",
      endDate: "Dec 2020",
      current: false,
      description: "Graduated with Honors. Specialized in Software Engineering and Database Design. Active member of the Computer Science Undergraduate Association (CSUA)."
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "SaaS Analytics Dashboard",
      description: "A real-time metrics visualizer tracking active SaaS users, engagement scores, and payment health. Features fully customizable dashboard layouts and clean CSV data export streams.",
      technologies: ["React", "TypeScript", "D3.js", "Tailwind CSS", "Express"],
      link: "https://github.com/example/analytics-dash"
    },
    {
      id: "proj-2",
      name: "Distributed Task Scheduler",
      description: "A secure, resilient job scheduler system capable of executing high-frequency background queues with automated retry-on-failure capabilities and simple slack notifications.",
      technologies: ["Node.js", "Redis", "Docker", "PostgreSQL"],
      link: "https://github.com/example/scheduler"
    }
  ],
  skills: [
    {
      id: "skill-1",
      name: "Languages",
      skills: ["TypeScript", "JavaScript (ES6+)", "Python", "SQL", "HTML5/CSS3"]
    },
    {
      id: "skill-2",
      name: "Frameworks & Libraries",
      skills: ["React", "Node.js", "Express", "Next.js", "Redux Toolkit", "Tailwind CSS"]
    },
    {
      id: "skill-3",
      name: "Tools & DevOps",
      skills: ["Git", "Docker", "PostgreSQL", "Redis", "AWS (S3/EC2)", "CI/CD (GitHub Actions)"]
    }
  ],
  languages: ["English (Native)", "Spanish (Conversational)"],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "Meta Front-End Developer Professional Certificate"
  ]
};

export const sampleJobDescription = `Senior Full-Stack Developer
Company: CloudSync Inc.
Location: San Francisco, CA (Hybrid)

About the Role:
We are seeking a Senior Full-Stack Developer to lead the architecture and development of our cloud-based task coordination dashboard. You will work heavily with TypeScript, React, Tailwind, and Node.js to design responsive user journeys, optimize heavy API routes, and build automated deployment pipelines.

Key Requirements:
- 3+ years experience building production-ready apps using TypeScript, React, and Node.js.
- Strong knowledge of database optimizations (specifically PostgreSQL or similar relational systems) and RESTful API structures.
- Practical experience designing and optimizing cloud-native CI/CD workflows (GitHub Actions, Docker).
- High collaboration skills, comfortable working in agile team iterations and code reviews.
- AWS cloud experience is a huge plus.`;
