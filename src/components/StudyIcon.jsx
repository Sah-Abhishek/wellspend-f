import { BookOpen, Code, Calculator, Brain, PenTool, GraduationCap, Lightbulb, FileText, Monitor, Cpu, Sigma, Languages, FlaskConical, Library } from 'lucide-react';

export const studyIconMap = {
  book: BookOpen,
  code: Code,
  calculator: Calculator,
  brain: Brain,
  pen: PenTool,
  graduation: GraduationCap,
  lightbulb: Lightbulb,
  file: FileText,
  monitor: Monitor,
  cpu: Cpu,
  sigma: Sigma,
  languages: Languages,
  flask: FlaskConical,
  library: Library,
};

export const studyIconKeys = Object.keys(studyIconMap);

export default function StudyIcon({ name, size = 16, className = '' }) {
  const Icon = studyIconMap[name] || BookOpen;
  return <Icon size={size} className={className} />;
}
