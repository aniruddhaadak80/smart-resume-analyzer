import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, convertInchesToTwip, ExternalHyperlink } from "docx";

// Premium color scheme matching PDF
const colors = {
    primary: "0f172a",      // Deep navy
    secondary: "1e40af",    // Royal blue
    accent: "0ea5e9",       // Sky blue
    text: "1e293b",         // Dark slate
    textLight: "475569",    // Medium slate
    white: "ffffff",
};

export const generateDocx = async (data: any) => {
    // Helper for created text - VERY compact sizes (half-points: 14 = 7pt, 16 = 8pt, 18 = 9pt, 20 = 10pt)
    const createText = (text: string, options: any = {}) => new TextRun({
        text,
        font: "Arial",
        size: options.size || 16, // Default to 8pt
        bold: options.bold || false,
        color: options.color || colors.text,
        ...options,
    });

    // Helper for section headers in sidebar - compact
    const sidebarSectionHeader = (text: string) => new Paragraph({
        children: [createText(text, { bold: true, color: colors.accent, size: 14 })], // 7pt header
        spacing: { before: 60, after: 30 }, // Reduced spacing
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.accent },
        },
    });

    // Helper for section headers in main - compact
    const mainSectionHeader = (text: string) => new Paragraph({
        children: [createText(text, { bold: true, color: colors.secondary, size: 16 })], // 8pt header
        spacing: { before: 80, after: 40 }, // Reduced spacing
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: colors.secondary },
        },
    });

    // Build sidebar content - compact
    const sidebarContent: Paragraph[] = [
        // Name
        new Paragraph({
            children: [createText(data.fullName?.toUpperCase() || "YOUR NAME", {
                bold: true,
                color: colors.white,
                size: 20, // 10pt Name
            })],
            spacing: { after: 20 },
        }),
        // Title
        new Paragraph({
            children: [createText(data.experience?.[0]?.role?.toUpperCase() || "PROFESSIONAL", {
                bold: true,
                color: colors.accent,
                size: 12, // 6pt Title
            })],
            spacing: { after: 60 },
        }),

        // Contact Section
        sidebarSectionHeader("CONTACT"),
    ];

    // Add contact items with clickable links
    if (data.contactInfo?.email) {
        sidebarContent.push(
            new Paragraph({
                children: [createText("Email", { color: "94a3b8", size: 12 })], // 6pt Label
                spacing: { before: 30 },
            }),
            new Paragraph({
                children: [
                    new ExternalHyperlink({
                        children: [createText(data.contactInfo.email, { color: colors.accent, size: 14 })], // 7pt Value
                        link: `mailto:${data.contactInfo.email}`,
                    }),
                ],
                spacing: { after: 40 },
            })
        );
    }

    if (data.contactInfo?.phone) {
        sidebarContent.push(
            new Paragraph({
                children: [createText("Phone", { color: "94a3b8", size: 12 })],
            }),
            new Paragraph({
                children: [
                    new ExternalHyperlink({
                        children: [createText(data.contactInfo.phone, { color: colors.accent, size: 14 })],
                        link: `tel:${data.contactInfo.phone}`,
                    }),
                ],
                spacing: { after: 40 },
            })
        );
    }

    if (data.contactInfo?.linkedin) {
        const linkedinUrl = data.contactInfo.linkedin.startsWith('http')
            ? data.contactInfo.linkedin
            : `https://${data.contactInfo.linkedin}`;
        sidebarContent.push(
            new Paragraph({
                children: [createText("LinkedIn", { color: "94a3b8", size: 12 })],
            }),
            new Paragraph({
                children: [
                    new ExternalHyperlink({
                        children: [createText(data.contactInfo.linkedin.replace('https://', '').replace('www.', ''), { color: colors.accent, size: 14, underline: {} })],
                        link: linkedinUrl,
                    }),
                ],
                spacing: { after: 40 },
            })
        );
    }

    if (data.contactInfo?.website) {
        const websiteUrl = data.contactInfo.website.startsWith('http')
            ? data.contactInfo.website
            : `https://${data.contactInfo.website}`;
        sidebarContent.push(
            new Paragraph({
                children: [createText("Portfolio", { color: "94a3b8", size: 12 })],
            }),
            new Paragraph({
                children: [
                    new ExternalHyperlink({
                        children: [createText(data.contactInfo.website.replace('https://', '').replace('www.', ''), { color: colors.accent, size: 14, underline: {} })],
                        link: websiteUrl,
                    }),
                ],
                spacing: { after: 40 },
            })
        );
    }

    if (data.contactInfo?.location) {
        sidebarContent.push(
            new Paragraph({
                children: [createText("Location", { color: "94a3b8", size: 12 })],
            }),
            new Paragraph({
                children: [createText(data.contactInfo.location, { color: colors.white, size: 14 })],
                spacing: { after: 40 },
            })
        );
    }

    // Skills Section
    sidebarContent.push(sidebarSectionHeader("SKILLS"));

    const skillsText = data.skills?.map((skill: string) => `• ${skill}`).join('\n') || '';
    sidebarContent.push(new Paragraph({
        children: [createText(skillsText, { color: colors.white, size: 13 })], // 6.5pt Skills
        spacing: { after: 80 },
    }));

    // Education Section
    if (data.education && data.education.length > 0) {
        sidebarContent.push(sidebarSectionHeader("EDUCATION"));

        data.education.forEach((edu: any) => {
            sidebarContent.push(
                new Paragraph({
                    children: [createText(edu.degree, { bold: true, color: colors.white, size: 14 })],
                    spacing: { before: 40 },
                }),
                new Paragraph({
                    children: [createText(edu.institution, { color: colors.accent, size: 13 })],
                }),
                new Paragraph({
                    children: [createText(`${edu.date}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}`, { color: "94a3b8", size: 12 })],
                    spacing: { after: 60 },
                })
            );
        });
    }

    // Projects Section
    if (data.projects && data.projects.length > 0) {
        sidebarContent.push(sidebarSectionHeader("PROJECTS"));

        data.projects.forEach((project: any) => {
            sidebarContent.push(
                new Paragraph({
                    children: [createText(project.name, { bold: true, color: colors.white, size: 14 })],
                    spacing: { before: 40 },
                }),
                new Paragraph({
                    children: [createText(project.description?.substring(0, 100) + (project.description?.length > 100 ? '...' : ''), { color: "cbd5e1", size: 12 })],
                }),
            );
            if (project.techStack) {
                sidebarContent.push(new Paragraph({
                    children: [createText(project.techStack.join(' • '), { color: colors.accent, size: 11 })],
                    spacing: { after: 60 },
                }));
            }
        });
    }

    // Certifications Section
    if (data.certifications && data.certifications.length > 0) {
        sidebarContent.push(sidebarSectionHeader("CERTIFICATIONS"));
        data.certifications.forEach((cert: string) => {
            sidebarContent.push(new Paragraph({
                children: [createText(`• ${cert}`, { color: colors.white, size: 13 })],
            }));
        });
    }

    // Languages Section
    if (data.languages && data.languages.length > 0) {
        sidebarContent.push(sidebarSectionHeader("LANGUAGES"));
        data.languages.forEach((lang: string) => {
            sidebarContent.push(new Paragraph({
                children: [createText(`• ${lang}`, { color: colors.white, size: 13 })],
            }));
        });
    }

    // Build main content
    const mainContent: Paragraph[] = [
        // Professional Summary
        mainSectionHeader("PROFESSIONAL SUMMARY"),
        new Paragraph({
            children: [createText(data.professionalSummary || '', { size: 18 })], // 9pt Summary
            spacing: { after: 100 },
            alignment: AlignmentType.JUSTIFIED,
        }),

        // Experience
        mainSectionHeader("PROFESSIONAL EXPERIENCE"),
    ];

    // Add experience entries
    data.experience?.forEach((exp: any) => {
        mainContent.push(
            new Paragraph({
                children: [createText(exp.role, { bold: true, color: colors.primary, size: 18 })], // 9pt Role
                spacing: { before: 80 },
            }),
            new Paragraph({
                children: [createText(exp.company, { bold: true, color: colors.secondary, size: 16 })], // 8pt Company
            }),
            new Paragraph({
                children: [createText(`${exp.date}${exp.location ? ` • ${exp.location}` : ''}`, { color: colors.textLight, size: 14 })], // 7pt Date
                spacing: { after: 30 },
            }),
        );

        exp.description?.forEach((bullet: string) => {
            mainContent.push(new Paragraph({
                children: [
                    createText("▸ ", { bold: true, color: colors.secondary, size: 16 }),
                    createText(bullet, { size: 16 }), // 8pt Body
                ],
                spacing: { after: 20, before: 10 },
                indent: { left: convertInchesToTwip(0.15) },
            }));
        });
    });

    // Add achievements if available
    if (data.achievements && data.achievements.length > 0) {
        mainContent.push(mainSectionHeader("KEY ACHIEVEMENTS"));
        data.achievements.forEach((achievement: string) => {
            mainContent.push(new Paragraph({
                children: [
                    createText("★ ", { bold: true, color: colors.secondary, size: 16 }),
                    createText(achievement, { size: 16 }), // 8pt Body
                ],
                spacing: { after: 20 },
                indent: { left: convertInchesToTwip(0.15) },
            }));
        });
    }

    // Create the two-column table
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.3), // Reduced margins
                        right: convertInchesToTwip(0.3),
                        bottom: convertInchesToTwip(0.3),
                        left: convertInchesToTwip(0.3),
                    },
                },
            },
            children: [
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                // Sidebar cell (32%)
                                new TableCell({
                                    width: { size: 32, type: WidthType.PERCENTAGE },
                                    shading: {
                                        fill: colors.primary,
                                        type: ShadingType.SOLID,
                                        color: colors.primary,
                                    },
                                    margins: {
                                        top: convertInchesToTwip(0.2),
                                        bottom: convertInchesToTwip(0.2),
                                        left: convertInchesToTwip(0.15),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: sidebarContent,
                                }),
                                // Main content cell (68%)
                                new TableCell({
                                    width: { size: 68, type: WidthType.PERCENTAGE },
                                    margins: {
                                        top: convertInchesToTwip(0.2),
                                        bottom: convertInchesToTwip(0.2),
                                        left: convertInchesToTwip(0.25),
                                        right: convertInchesToTwip(0.15),
                                    },
                                    children: mainContent,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        }],
    });

    return await Packer.toBlob(doc);
};
