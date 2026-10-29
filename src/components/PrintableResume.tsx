import {
    Mail,
    Phone,
    Globe,
    MapPin,
    Briefcase,
    GraduationCap,
    Wrench,
    FolderGit2,
    Award,
    Languages,
    Trophy,
} from 'lucide-react';
import { LinkedinIcon } from '@/components/BrandIcons';

/**
 * A clean, paper-first rendering of a resume.
 *
 * The component intentionally uses light, print-safe colours (no dark theme
 * classes) so the exact same markup looks good on screen and on paper.
 * The `.printable-resume` class is styled by the print media query in
 * `src/app/globals.css`.
 */

type ResumeData = {
    fullName?: string;
    contactInfo?: {
        email?: string;
        phone?: string;
        linkedin?: string;
        website?: string;
        location?: string;
    };
    professionalSummary?: string;
    candidateSummary?: string;
    skills?: string[];
    skillsFound?: string[];
    experience?: Array<{
        company?: string;
        role?: string;
        date?: string;
        location?: string;
        description?: string[];
    }>;
    education?: Array<{
        institution?: string;
        degree?: string;
        date?: string;
        gpa?: string;
    }>;
    projects?: Array<{
        name?: string;
        description?: string;
        techStack?: string[];
        link?: string;
    }>;
    certifications?: string[];
    languages?: string[];
    achievements?: string[];
};

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <section className="printable-section mt-5">
            <h2 className="printable-section-title flex items-center gap-2 border-b border-slate-300 pb-1 text-[12pt] font-bold uppercase tracking-wide text-slate-900">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function PrintableResume({ data }: { data: ResumeData | null | undefined }) {
    if (!data) return null;

    const contact = data.contactInfo || {};
    const summary = data.professionalSummary || data.candidateSummary;
    const skills = data.skills?.length ? data.skills : data.skillsFound;

    const contactEntries = [
        contact.email && { icon: <Mail className="h-3 w-3" />, value: contact.email },
        contact.phone && { icon: <Phone className="h-3 w-3" />, value: contact.phone },
        contact.location && { icon: <MapPin className="h-3 w-3" />, value: contact.location },
        contact.linkedin && { icon: <LinkedinIcon className="h-3 w-3" />, value: contact.linkedin },
        contact.website && { icon: <Globe className="h-3 w-3" />, value: contact.website },
    ].filter(Boolean) as Array<{ icon: React.ReactNode; value: string }>;

    const hasExperience = Boolean(data.experience && data.experience.length > 0);
    const hasEducation = Boolean(data.education && data.education.length > 0);
    const hasProjects = Boolean(data.projects && data.projects.length > 0);
    const hasCertifications = Boolean(data.certifications && data.certifications.length > 0);
    const hasLanguages = Boolean(data.languages && data.languages.length > 0);
    const hasAchievements = Boolean(data.achievements && data.achievements.length > 0);

    return (
        <article className="printable-resume mx-auto w-full max-w-[210mm] bg-white px-8 py-8 text-slate-900 shadow-sm">
            {/* Header */}
            <div className="printable-header border-b-2 border-slate-900 pb-3 text-center">
                <h1 className="text-[22pt] font-bold leading-tight tracking-tight text-slate-900">
                    {data.fullName || 'Your Name'}
                </h1>
                {contactEntries.length > 0 && (
                    <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10pt] text-slate-700">
                        {contactEntries.map((entry, index) => (
                            <li key={index} className="flex items-center gap-1.5">
                                <span className="text-slate-500">{entry.icon}</span>
                                {entry.value}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <Section icon={<Briefcase className="h-4 w-4 text-slate-600" />} title="Professional Summary">
                    <p className="mt-2 text-[10.5pt] leading-relaxed text-slate-800">{summary}</p>
                </Section>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <Section icon={<Wrench className="h-4 w-4 text-slate-600" />} title="Skills">
                    <p className="mt-2 text-[10.5pt] leading-relaxed text-slate-800">{skills.join(' • ')}</p>
                </Section>
            )}

            {/* Experience */}
            {hasExperience && (
                <Section icon={<Briefcase className="h-4 w-4 text-slate-600" />} title="Experience">
                    <div className="mt-2 space-y-3">
                        {data.experience!.map((exp, index) => (
                            <div key={index} className="printable-item">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                    <h3 className="text-[11.5pt] font-bold text-slate-900">
                                        {exp.role || 'Role'}
                                        {exp.company ? <span className="font-normal text-slate-700"> — {exp.company}</span> : null}
                                    </h3>
                                    <span className="text-[10pt] italic text-slate-600">{exp.date}</span>
                                </div>
                                {exp.location ? (
                                    <p className="text-[10pt] text-slate-600">{exp.location}</p>
                                ) : null}
                                {exp.description && exp.description.length > 0 && (
                                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[10.5pt] text-slate-800">
                                        {exp.description.map((bullet, bulletIndex) => (
                                            <li key={bulletIndex}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Education */}
            {hasEducation && (
                <Section icon={<GraduationCap className="h-4 w-4 text-slate-600" />} title="Education">
                    <div className="mt-2 space-y-2">
                        {data.education!.map((edu, index) => (
                            <div key={index} className="printable-item flex flex-wrap items-baseline justify-between gap-x-4">
                                <div>
                                    <h3 className="text-[11pt] font-bold text-slate-900">{edu.degree || 'Degree'}</h3>
                                    <p className="text-[10pt] text-slate-700">{edu.institution}</p>
                                </div>
                                <div className="text-right text-[10pt] text-slate-600">
                                    {edu.date ? <span>{edu.date}</span> : null}
                                    {edu.gpa ? <span className="block">GPA {edu.gpa}</span> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Projects */}
            {hasProjects && (
                <Section icon={<FolderGit2 className="h-4 w-4 text-slate-600" />} title="Projects">
                    <div className="mt-2 space-y-2">
                        {data.projects!.map((project, index) => (
                            <div key={index} className="printable-item">
                                <h3 className="text-[11pt] font-bold text-slate-900">
                                    {project.name}
                                    {project.link ? (
                                        <span className="ml-2 text-[9.5pt] font-normal text-slate-600">{project.link}</span>
                                    ) : null}
                                </h3>
                                {project.description ? (
                                    <p className="text-[10.5pt] text-slate-800">{project.description}</p>
                                ) : null}
                                {project.techStack && project.techStack.length > 0 ? (
                                    <p className="text-[9.5pt] text-slate-600">Tech: {project.techStack.join(', ')}</p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Certifications & Languages */}
            {(hasCertifications || hasLanguages) && (
                <Section icon={<Award className="h-4 w-4 text-slate-600" />} title="Certifications & Languages">
                    {hasCertifications && (
                        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[10.5pt] text-slate-800">
                            {data.certifications!.map((certification, index) => (
                                <li key={index}>{certification}</li>
                            ))}
                        </ul>
                    )}
                    {hasLanguages && (
                        <p className="mt-2 flex items-center gap-1.5 text-[10.5pt] text-slate-800">
                            <Languages className="h-3.5 w-3.5 text-slate-600" />
                            {data.languages!.join(', ')}
                        </p>
                    )}
                </Section>
            )}

            {/* Achievements */}
            {hasAchievements && (
                <Section icon={<Trophy className="h-4 w-4 text-slate-600" />} title="Achievements">
                    <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[10.5pt] text-slate-800">
                        {data.achievements!.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                        ))}
                    </ul>
                </Section>
            )}
        </article>
    );
}
