'use client';

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// Premium color palette
const colors = {
    primary: '#0f172a',      // Deep navy
    secondary: '#1e40af',    // Royal blue
    accent: '#0ea5e9',       // Sky blue
    highlight: '#f59e0b',    // Amber for metrics
    success: '#10b981',      // Emerald for achievements
    text: '#1e293b',         // Dark slate
    textLight: '#475569',    // Medium slate
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        fontFamily: 'Helvetica',
    },
    // Left Sidebar - Wider for balance
    sidebar: {
        width: '32%',
        backgroundColor: colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 14,
        color: colors.white,
    },
    // Right Main Content
    main: {
        width: '68%',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    },
    // Name Section - BIGGER
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    // Section Titles - Clear separation
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.accent,
        marginBottom: 8,
        marginTop: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
        paddingBottom: 4,
    },
    sectionTitleMain: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 10,
        marginTop: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 2,
        borderBottomColor: colors.secondary,
        paddingBottom: 5,
    },
    // Contact Items - Better spacing
    contactRow: {
        marginBottom: 6,
    },
    contactLabel: {
        fontSize: 7,
        color: '#94a3b8',
        marginBottom: 1,
    },
    contactValue: {
        fontSize: 8,
        color: colors.white,
    },
    contactLink: {
        fontSize: 8,
        color: colors.accent,
        textDecoration: 'none',
    },
    // Skills - Larger tags
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    skillTag: {
        fontSize: 7.5,
        color: colors.white,
        backgroundColor: 'rgba(14, 165, 233, 0.3)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 3,
        marginBottom: 4,
        marginRight: 4,
    },
    // Education - Better structure
    eduItem: {
        marginBottom: 8,
    },
    eduDegree: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.white,
    },
    eduSchool: {
        fontSize: 8,
        color: colors.accent,
        marginTop: 1,
    },
    eduDate: {
        fontSize: 7,
        color: '#94a3b8',
        marginTop: 1,
    },
    // Experience - LARGER with line spacing
    expItem: {
        marginBottom: 14,
    },
    expRole: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    expCompany: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.secondary,
        marginTop: 2,
    },
    expMeta: {
        fontSize: 9,
        color: colors.textLight,
        marginTop: 2,
        marginBottom: 6,
    },
    expBullet: {
        fontSize: 10,
        color: colors.text,
        marginLeft: 10,
        marginBottom: 6,
        lineHeight: 1.5,
    },
    bulletPoint: {
        color: colors.secondary,
        fontWeight: 'bold',
    },
    // Highlighted text for metrics
    highlightText: {
        color: colors.secondary,
        fontWeight: 'bold',
    },
    // Summary - BIGGER with line height
    summary: {
        fontSize: 10.5,
        color: colors.text,
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    // Projects - Compact
    projectItem: {
        marginBottom: 6,
    },
    projectName: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: colors.white,
    },
    projectDesc: {
        fontSize: 7,
        color: '#cbd5e1',
        lineHeight: 1.3,
        marginTop: 2,
    },
    projectTech: {
        fontSize: 7,
        color: colors.accent,
        marginTop: 2,
    },
    // Small items
    smallItem: {
        fontSize: 7.5,
        color: colors.white,
        marginBottom: 3,
        lineHeight: 1.3,
    },
    // Achievement - LARGER
    achievementBullet: {
        fontSize: 10,
        color: colors.text,
        marginLeft: 10,
        marginBottom: 8,
        lineHeight: 1.5,
    },
    achieveStar: {
        color: colors.highlight,
        fontWeight: 'bold',
    },
});

// Helper to highlight metrics in text (numbers, percentages)
const formatBullet = (text: string) => {
    return text;
};

export const ResumePDF = ({ data }: { data: any }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Left Sidebar */}
                <View style={styles.sidebar}>
                    {/* Name & Title */}
                    <Text style={styles.name}>{data.fullName}</Text>
                    {data.experience?.[0]?.role && (
                        <Text style={styles.title}>{data.experience[0].role}</Text>
                    )}

                    {/* Contact Info - Better structured */}
                    <Text style={styles.sectionTitle}>Contact</Text>

                    {data.contactInfo?.email && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>EMAIL</Text>
                            <Link src={`mailto:${data.contactInfo.email}`} style={styles.contactLink}>
                                {data.contactInfo.email}
                            </Link>
                        </View>
                    )}

                    {data.contactInfo?.phone && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>PHONE</Text>
                            <Link src={`tel:${data.contactInfo.phone}`} style={styles.contactLink}>
                                {data.contactInfo.phone}
                            </Link>
                        </View>
                    )}

                    {data.contactInfo?.linkedin && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>LINKEDIN</Text>
                            <Link src={data.contactInfo.linkedin.startsWith('http') ? data.contactInfo.linkedin : `https://${data.contactInfo.linkedin}`} style={styles.contactLink}>
                                {data.contactInfo.linkedin.replace('https://', '').replace('www.', '').substring(0, 30)}
                            </Link>
                        </View>
                    )}

                    {data.contactInfo?.website && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>PORTFOLIO</Text>
                            <Link src={data.contactInfo.website.startsWith('http') ? data.contactInfo.website : `https://${data.contactInfo.website}`} style={styles.contactLink}>
                                {data.contactInfo.website.replace('https://', '').replace('www.', '').substring(0, 30)}
                            </Link>
                        </View>
                    )}

                    {data.contactInfo?.location && (
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>LOCATION</Text>
                            <Text style={styles.contactValue}>{data.contactInfo.location}</Text>
                        </View>
                    )}

                    {/* Skills */}
                    <Text style={styles.sectionTitle}>Technical Skills</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills?.map((skill: string, i: number) => (
                            <Text key={i} style={styles.skillTag}>{skill}</Text>
                        ))}
                    </View>

                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Education</Text>
                            {data.education.map((edu: any, i: number) => (
                                <View key={i} style={styles.eduItem}>
                                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                                    <Text style={styles.eduSchool}>{edu.institution}</Text>
                                    <Text style={styles.eduDate}>
                                        {edu.date} {edu.gpa && `• GPA: ${edu.gpa}`}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Projects</Text>
                            {data.projects.map((project: any, i: number) => (
                                <View key={i} style={styles.projectItem}>
                                    <Text style={styles.projectName}>{project.name}</Text>
                                    <Text style={styles.projectDesc}>
                                        {project.description?.substring(0, 90)}...
                                    </Text>
                                    {project.techStack && (
                                        <Text style={styles.projectTech}>{project.techStack.slice(0, 5).join(' • ')}</Text>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Certifications</Text>
                            {data.certifications.map((cert: string, i: number) => (
                                <Text key={i} style={styles.smallItem}>▪ {cert}</Text>
                            ))}
                        </>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Languages</Text>
                            {data.languages.map((lang: string, i: number) => (
                                <Text key={i} style={styles.smallItem}>▪ {lang}</Text>
                            ))}
                        </>
                    )}
                </View>

                {/* Right Main Content */}
                <View style={styles.main}>
                    {/* Professional Summary - LARGER */}
                    <Text style={styles.sectionTitleMain}>Professional Summary</Text>
                    <Text style={styles.summary}>{data.professionalSummary}</Text>

                    {/* Experience - LARGER with spacing */}
                    <Text style={styles.sectionTitleMain}>Professional Experience</Text>
                    {data.experience?.map((exp: any, i: number) => (
                        <View key={i} style={styles.expItem}>
                            <Text style={styles.expRole}>{exp.role}</Text>
                            <Text style={styles.expCompany}>{exp.company}</Text>
                            <Text style={styles.expMeta}>
                                {exp.date} {exp.location && `  •  ${exp.location}`}
                            </Text>
                            {exp.description?.map((bullet: string, j: number) => (
                                <Text key={j} style={styles.expBullet}>
                                    <Text style={styles.bulletPoint}>▸ </Text>{formatBullet(bullet)}
                                </Text>
                            ))}
                        </View>
                    ))}

                    {/* Achievements - LARGER with spacing */}
                    {data.achievements && data.achievements.length > 0 && (
                        <>
                            <Text style={styles.sectionTitleMain}>Key Achievements</Text>
                            {data.achievements.map((achievement: string, i: number) => (
                                <Text key={i} style={styles.achievementBullet}>
                                    <Text style={styles.achieveStar}>★ </Text>{achievement}
                                </Text>
                            ))}
                        </>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default ResumePDF;
