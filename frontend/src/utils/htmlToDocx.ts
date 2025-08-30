import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import { EventReport, ContentBlock } from '../store/reportStore';

// Helper functions for professional font formatting
const createTextRun = (text: string, options?: {
  bold?: boolean;
  italics?: boolean;
  color?: string;
  break?: number;
  size?: number;
}) => {
  return new TextRun({
    text,
    font: 'Times New Roman',
    size: options?.size || 24, // 12pt = 24 half-points
    bold: options?.bold || false,
    italics: options?.italics || false,
    color: options?.color || '000000',
    break: options?.break
  });
};

const createTitleTextRun = (text: string, options?: {
  color?: string;
  break?: number;
  size?: number;
}) => {
  return new TextRun({
    text,
    font: 'Times New Roman',
    size: options?.size || 28, // 14pt = 28 half-points
    bold: true,
    color: options?.color || '000000',
    break: options?.break
  });
};

// Helper function to get image type from URL or data
const getImageType = (imageUrl: string): 'png' | 'jpg' | 'gif' | 'bmp' => {
  if (imageUrl.startsWith('data:image/')) {
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    const type = mimeType.split('/')[1];
    if (type === 'jpeg') return 'jpg';
    if (['png', 'jpg', 'gif', 'bmp'].includes(type)) {
      return type as 'png' | 'jpg' | 'gif' | 'bmp';
    }
    return 'png';
  }

  const extension = imageUrl.split('.').pop()?.toLowerCase();
  if (extension === 'jpeg') return 'jpg';
  if (['png', 'jpg', 'gif', 'bmp'].includes(extension || '')) {
    return extension as 'png' | 'jpg' | 'gif' | 'bmp';
  }
  return 'png';
};

// Helper function to fetch image from URL and convert to array buffer
const fetchImageAsArrayBuffer = async (imageUrl: string): Promise<ArrayBuffer> => {
  try {
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

// Helper function to get logo image data with exact HTML mapping
const getLogoImageData = async (logoId: string): Promise<ArrayBuffer | null> => {
  try {
    const logoConfig = {
      bvm: { src: '/BVM Logo-1.png', type: 'png' },
      cvm: { src: '/CVM Logo.png', type: 'png' },
      gtu: { src: '/GTU.png', type: 'png' },
      nss: { src: '/nss.png', type: 'png' },
      NCC: { src: '/NCC logo.png', type: 'png' },
      ieee: { src: '/IEEE BVM SB.png', type: 'png' },
      TRS: { src: '/TRS Logo.jpg', type: 'jpg' },
      TSA: { src: '/TSA Logo.png', type: 'png' },
      gdg: { src: '/GDG.png', type: 'png' },
      gfg: { src: '/GFG Logo.jpg', type: 'jpg' },
      "ML Club": { src: '/ML Club Logo.png', type: 'png' },
      csi: { src: '/CSI.jpeg', type: 'jpg' },
      byte: { src: '/BYTE.jpeg', type: 'jpg' }
    }[logoId];

    if (!logoConfig) return null;

    const logoUrl = window.location.origin + logoConfig.src;
    return await fetchImageAsArrayBuffer(logoUrl);
  } catch (error) {
    console.error(`Failed to load logo ${logoId}:`, error);
    return null;
  }
};

const getLogoType = (logoId: string): 'png' | 'jpg' => {
  const logoTypes = {
    bvm: 'png' as const,
    cvm: 'png' as const,
    gtu: 'png' as const,
    nss: 'png' as const,
    NCC: 'png' as const,
    ieee: 'png' as const,
    TRS: 'jpg' as const,
    TSA: 'png' as const,
    gdg: 'png' as const,
    gfg: 'jpg' as const,
    'ML Club': 'png' as const,
    csi: 'jpg' as const,
    byte: 'jpg' as const
  };
  return logoTypes[logoId as keyof typeof logoTypes] || 'png';
};

// Helper function to extract text content from Word document
const extractWordDocumentContent = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.warn('Failed to extract Word document content:', error);
    return `[Content extraction failed for: ${file.name}]`;
  }
};

// Helper function to extract content from various file types
const extractAttendanceContent = async (file: File): Promise<string> => {
  const fileType = file.type;

  // Handle Word documents
  if (fileType.includes('wordprocessingml') || fileType.includes('msword') ||
    file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
    return await extractWordDocumentContent(file);
  }

  // Handle text files
  if (fileType.includes('text/') || file.name.toLowerCase().endsWith('.txt')) {
    return await file.text();
  }

  // For other file types (PDF, Excel, images), return a placeholder
  if (fileType.includes('pdf')) {
    return `[PDF Document: ${file.name}]\nThis PDF document contains the attendance records for the event. The original file has been referenced in this report.`;
  }

  if (fileType.includes('spreadsheet') || fileType.includes('excel') ||
    file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
    return `[Excel Spreadsheet: ${file.name}]\nThis Excel file contains the attendance data for the event. The original file has been referenced in this report.`;
  }

  if (fileType.includes('image/')) {
    return `[Image File: ${file.name}]\nThis image contains the attendance sheet for the event. The original file has been referenced in this report.`;
  }

  return `[File: ${file.name}]\nContent extraction not supported for this file type (${fileType}). The original file has been referenced in this report.`;
};

export const generateExactHtmlReplicaDocx = async (
  report: EventReport, 
  attendanceSheet?: File | null,
  attendanceSheets?: File[],
  miscellaneousFiles?: File[]
) => {
  try {
    const doc = await createHtmlReplicaDocument(report, attendanceSheet, attendanceSheets, miscellaneousFiles);

    const blob = await Packer.toBlob(doc);
    const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};

const createHtmlReplicaDocument = async (
  report: EventReport, 
  attendanceSheet?: File | null, 
  attendanceSheets?: File[], 
  miscellaneousFiles?: File[]
): Promise<Document> => {
  const children = [];

  // HEADER SECTION - Exact replica of HTML header

  // Selected Logos Section (exactly like HTML)
  if (report.selectedLogos && report.selectedLogos.length > 0) {
    const logoChildren = [];

    for (const logoId of report.selectedLogos) {
      try {
        const logoData = await getLogoImageData(logoId);
        if (logoData) {
          logoChildren.push(
            new ImageRun({
              data: logoData,
              transformation: {
                width: 96,  // Increased from 64px to 96px (w-24)
                height: 96  // Increased from 64px to 96px (h-24)
              },
              type: getLogoType(logoId)
            })
          );

          // Add better spacing between logos (space-x-8 = 32px)
          if (logoId !== report.selectedLogos[report.selectedLogos.length - 1]) {
            logoChildren.push(createTextRun('        ', { size: 24 })); // 8 spaces with proper font for better spacing
          }
        }
      } catch (error) {
        console.warn(`Failed to load logo ${logoId}:`, error);
      }
    }

    if (logoChildren.length > 0) {
      children.push(
        new Paragraph({
          children: logoChildren,
          alignment: AlignmentType.CENTER,
          spacing: { after: 320, before: 160 } // Increased spacing: mb-8 = 32px = 320 twips, added top margin
        })
      );
    }
  }

  // Institution Header (exact replica)
  children.push(
    // Main institution name
    new Paragraph({
      children: [
        createTitleTextRun('BIRLA VISHVAKARMA MAHAVIDYALAYA', { color: '1f2937', size: 36 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 } // mb-1 = 4px = 40 twips
    }),

    // Subtitle lines
    new Paragraph({
      children: [
        createTextRun('Engineering College • Gujarat Technological University', { color: '6b7280' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 }
    }),

    new Paragraph({
      children: [
        createTextRun('Vallabh Vidyanagar, Anand - 388120', { color: '6b7280' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 } // mb-4 = 16px = 160 twips
    })
  );

  // Event Title Section with borders (exact replica)
  children.push(
    // Top border line
    new Paragraph({
      children: [
        new TextRun({
          text: '________________________________________________',
          color: 'd1d5db' // border-gray-200
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 } // py-4 spacing
    }),

    // Event Title
    new Paragraph({
      children: [
        createTitleTextRun(report.title.toUpperCase(), { color: '1f2937', size: 32 }) // Larger title
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 } // mb-2
    })
  );

  // Tagline (if exists)
  if (report.tagline) {
    children.push(
      new Paragraph({
        children: [
          createTitleTextRun(report.tagline, { color: '374151' })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 }
      })
    );
  }

  // Bottom border line
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '________________________________________________',
          color: 'd1d5db'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 }
    })
  );

  // Event Type and Organized By
  const eventTypeAndOrg = [];
  if (report.eventType) {
    eventTypeAndOrg.push(
      createTextRun(report.eventType, { bold: true, color: '6b7280' })
    );
  }
  if (report.organizedBy) {
    if (eventTypeAndOrg.length > 0) {
      eventTypeAndOrg.push(createTextRun('\n', { break: 1 }));
    }
    eventTypeAndOrg.push(
      createTextRun(`Organized by: ${report.organizedBy}`, { color: '6b7280' })
    );
  }

  if (eventTypeAndOrg.length > 0) {
    children.push(
      new Paragraph({
        children: eventTypeAndOrg,
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 } // pb-8 = 32px = 320 twips
      })
    );
  }

  // EVENT DETAILS SECTION - Exact replica with grid layout
  children.push(
    new Paragraph({
      children: [
        createTitleTextRun('EVENT DETAILS', { color: '1f2937' })
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 160, before: 320 }
    })
  );

  // Create event details as a two-column table (grid replica)
  const eventDetailRows = [];
  const eventDetails = [
    {
      label: 'DATE & TIME',
      value: report.startDate ?
        `${new Date(report.startDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}${report.endDate ? ` - ${new Date(report.endDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}` : ''}` : null
    },
    {
      label: 'VENUE',
      value: report.venue
    },
    {
      label: 'TARGET AUDIENCE',
      value: report.targetAudience
    },
    {
      label: 'NUMBER OF PARTICIPANTS',
      value: report.participantCount?.toString()
    },
    {
      label: 'ACADEMIC YEAR',
      value: report.academicYear
    },
    {
      label: 'SEMESTER',
      value: report.semester
    }
  ].filter(detail => detail.value);

  // Create rows in pairs for two-column layout
  for (let i = 0; i < eventDetails.length; i += 2) {
    const leftDetail = eventDetails[i];
    const rightDetail = eventDetails[i + 1];

    const cells = [];

    // Left column
    if (leftDetail) {
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                createTextRun(leftDetail.label, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 40 }
            }),
            new Paragraph({
              children: [
                createTextRun(leftDetail.value || '', { color: '374151' })
              ]
            })
          ],
          width: { size: 48, type: WidthType.PERCENTAGE },
          margins: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
          }
        })
      );
    } else {
      cells.push(
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
          width: { size: 48, type: WidthType.PERCENTAGE }
        })
      );
    }

    // Right column
    if (rightDetail) {
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                createTextRun(rightDetail.label, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 40 }
            }),
            new Paragraph({
              children: [
                createTextRun(rightDetail.value || '', { color: '374151' })
              ]
            })
          ],
          width: { size: 48, type: WidthType.PERCENTAGE },
          margins: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
          }
        })
      );
    } else {
      cells.push(
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
          width: { size: 48, type: WidthType.PERCENTAGE }
        })
      );
    }

    eventDetailRows.push(new TableRow({ children: cells }));
  }

  if (eventDetailRows.length > 0) {
    children.push(
      new Table({
        rows: eventDetailRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 },
          insideHorizontal: { style: BorderStyle.NONE, size: 0 },
          insideVertical: { style: BorderStyle.NONE, size: 0 }
        }
      }),

      // Border line after event details
      new Paragraph({
        children: [
          new TextRun({
            text: '________________________________________________',
            color: 'd1d5db'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 }
      })
    );
  }

  // PEOPLE INVOLVED SECTION - Exact replica
  if ((report.facultyCoordinators && report.facultyCoordinators.length > 0) ||
    (report.studentCoordinators && report.studentCoordinators.length > 0) ||
    report.chiefGuest?.name) {

    children.push(
      new Paragraph({
        children: [
          createTitleTextRun('PEOPLE INVOLVED', { color: '1f2937', size: 28 })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 160 }
      })
    );

    // Faculty Coordinators
    if (report.facultyCoordinators && report.facultyCoordinators.length > 0) {
      children.push(
        new Paragraph({
          children: [
            createTextRun('FACULTY COORDINATORS', { bold: true, color: '1f2937' })
          ],
          spacing: { after: 80 }
        })
      );

      report.facultyCoordinators.forEach((coordinator) => {
        if (coordinator.name) {
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${coordinator.name}${coordinator.designation ? `, ${coordinator.designation}` : ''}${coordinator.email ? ` (${coordinator.email})` : ''}`, { color: '374151' })
              ],
              spacing: { after: 40 }
            })
          );
        }
      });
    }

    // Student Coordinators
    if (report.studentCoordinators && report.studentCoordinators.length > 0) {
      children.push(
        new Paragraph({
          children: [
            createTextRun('STUDENT COORDINATORS', { bold: true, color: '1f2937' })
          ],
          spacing: { after: 80, before: 160 }
        })
      );

      report.studentCoordinators.forEach((coordinator) => {
        if (coordinator.name) {
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${coordinator.name}${coordinator.rollNo ? ` (${coordinator.rollNo})` : ''}${coordinator.contact ? ` - ${coordinator.contact}` : ''}`, { color: '374151' })
              ],
              spacing: { after: 40 }
            })
          );
        }
      });
    }

    // Chief Guest
    if (report.chiefGuest?.name) {
      children.push(
        new Paragraph({
          children: [
            createTextRun('CHIEF GUEST', { bold: true, color: '1f2937' })
          ],
          spacing: { after: 80, before: 160 }
        }),
        new Paragraph({
          children: [
            createTextRun(`${report.chiefGuest.name}${report.chiefGuest.designation ? `, ${report.chiefGuest.designation}` : ''}${report.chiefGuest.affiliation ? `, ${report.chiefGuest.affiliation}` : ''}`, { color: '374151' })
          ],
          spacing: { after: 40 }
        })
      );
    }

    // Border line
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '________________________________________________',
            color: 'd1d5db'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 240 }
      })
    );
  }

  // CONTENT BLOCKS SECTION - Exact replica
  if (report.contentBlocks && report.contentBlocks.length > 0) {

    for (let index = 0; index < report.contentBlocks.length; index++) {
      const block = report.contentBlocks[index];

      // Block title with numbering (exact replica)
      if (block.title) {
        children.push(
          new Paragraph({
            children: [
              createTitleTextRun(`${index + 1}. ${block.title}`, { color: '1f2937' })
            ],
            spacing: { after: 120, before: 240 }
          })
        );
      }

      // Handle different block types exactly like HTML
      await addContentBlockExactReplica(children, block);
    }

    // Border line
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '________________________________________________',
            color: 'd1d5db'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 }
      })
    );
  }

  // ATTENDANCE SHEET SECTION - Add if attendance sheet is provided
  // if (attendanceSheet) {
  //   try {
  //     // Extract content from the attendance sheet
  //     const attendanceContent = await extractAttendanceContent(attendanceSheet);

  //     children.push(
  //       // Section header
  //       new Paragraph({
  //         children: [
  //           createTitleTextRun('ATTENDANCE SHEET', { color: '1f2937', size: 28 })
  //         ],
  //         alignment: AlignmentType.LEFT,
  //         spacing: { after: 160, before: 320 }
  //       }),
        
  //     );

  //     // Add the extracted content
  //     if (attendanceContent && attendanceContent.trim()) {
  //       // Split content into paragraphs
  //       const contentParagraphs = attendanceContent.split('\n').filter(line => line.trim());

  //       for (const paragraph of contentParagraphs) {
  //         children.push(
  //           new Paragraph({
  //             children: [
  //               createTextRun(paragraph.trim(), { color: '374151' })
  //             ],
  //             alignment: AlignmentType.LEFT,
  //             spacing: { after: 120 }
  //           })
  //         );
  //       }
  //     } else {
  //       // Fallback if content extraction failed
  //       children.push(
  //         new Paragraph({
  //           children: [
  //             createTextRun('⚠️ ', { size: 24, color: 'f59e0b' }),
  //             createTextRun('Content Extraction Note: ', { bold: true, color: 'f59e0b' }),
  //             createTextRun('Unable to extract readable content from the uploaded file. The file may be in a format that requires manual review.',
  //               { color: '6b7280', italics: true })
  //           ],
  //           spacing: { after: 160 }
  //         })
  //       );
  //     }

  //     // Border line after attendance section
  //     children.push(
  //       new Paragraph({
  //         children: [
  //           new TextRun({
  //             text: '________________________________________________',
  //             color: 'd1d5db'
  //           })
  //         ],
  //         alignment: AlignmentType.CENTER,
  //         spacing: { before: 240, after: 240 }
  //       })
  //     );
  //   } catch (error) {
  //     console.error('Error processing attendance sheet:', error);

  //     // Fallback section if processing fails
  //     children.push(
  //       new Paragraph({
  //         children: [
  //           createTitleTextRun('ATTENDANCE SHEET', { color: '1f2937', size: 28 })
  //         ],
  //         alignment: AlignmentType.LEFT,
  //         spacing: { after: 160, before: 320 }
  //       }),

  //       new Paragraph({
  //         children: [
  //           createTextRun('❌ ', { size: 24, color: 'ef4444' }),
  //           createTextRun('Processing Error: ', { bold: true, color: 'ef4444' }),
  //           createTextRun(`Failed to process attendance file "${attendanceSheet.name}". Please ensure the file is not corrupted and try again.`,
  //             { color: '6b7280', italics: true })
  //         ],
  //         spacing: { after: 240 }
  //       }),

  //       new Paragraph({
  //         children: [
  //           new TextRun({
  //             text: '________________________________________________',
  //             color: 'd1d5db'
  //           })
  //         ],
  //         alignment: AlignmentType.CENTER,
  //         spacing: { before: 160, after: 240 }
  //       })
  //     );
  //   }
  // }

  // GENERATED CONTENT SECTION - Only for summary reports (reports with no content blocks)
  if (report.generatedContent && (!report.contentBlocks || report.contentBlocks.length === 0)) {
    children.push(
      new Paragraph({
        children: [
          createTitleTextRun('EXECUTIVE SUMMARY', { color: '1f2937', size: 28 })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 160 }
      }),

      new Paragraph({
        children: [
          createTextRun(report.generatedContent, { color: '1f2937' })
        ],
        alignment: AlignmentType.BOTH,
        spacing: { after: 80 }
      })
    );
  }

  // ATTENDANCE SHEET SECTION - Only handle images
  if ((attendanceSheets && attendanceSheets.length > 0) || attendanceSheet) {
    const filesToProcess = attendanceSheets && attendanceSheets.length > 0 ? attendanceSheets : (attendanceSheet ? [attendanceSheet] : []);
    
    // Filter only image files
    const imageFiles = filesToProcess.filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
    });
    
    if (imageFiles.length > 0) {
      children.push(
        new Paragraph({
          children: [
            createTitleTextRun('ATTENDANCE SHEET', { color: '1f2937', size: 28 })
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 160, before: 320 }
        })
      );

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        try {
          // Handle image files
          const imageData = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
          });

          const fileType = fileExtension === 'jpeg' ? 'jpg' : (fileExtension as 'png' | 'jpg' | 'gif' | 'bmp');

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 600,
                    height: 700
                  },
                  type: fileType
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: i === 0 ? 120 : 240, after: 240 }
            })
          );
        } catch (error) {
          console.error(`Error processing attendance image ${file.name}:`, error);
          children.push(
            new Paragraph({
              children: [
                createTextRun(`❌ Error processing attendance image`, { bold: true, color: 'ef4444' }),
                createTextRun('\nUnable to process this attendance image. Please verify the file is not corrupted.', { color: '6b7280', italics: true })
              ],
              spacing: { after: 160, before: i === 0 ? 120 : 240 }
            })
          );
        }
      }

      // Border line after attendance section
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '________________________________________________',
              color: 'd1d5db'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 }
        })
      );
    }
  }

  // MISCELLANEOUS FILES SECTION - Embed files like attendance sheets
  if (miscellaneousFiles && miscellaneousFiles.length > 0) {
    children.push(
      new Paragraph({
        children: [
          createTitleTextRun('MISCELLANEOUS FILES', { color: '1f2937', size: 28 })
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 160, before: 320 }
      }),
      new Paragraph({
        children: [
          createTextRun('The following additional files are included with this event report:', { color: '374151' })
        ],
        spacing: { after: 160 }
      })
    );

    for (let i = 0; i < miscellaneousFiles.length; i++) {
      const file = miscellaneousFiles[i];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
      const isWord = ['doc', 'docx'].includes(fileExtension || '');
      const isPowerPoint = ['ppt', 'pptx'].includes(fileExtension || '');
      const isPDF = fileExtension === 'pdf';

      try {
        if (isImage) {
          // Handle image files - embed them directly
          const imageData = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
          });

          const fileType = fileExtension === 'jpeg' ? 'jpg' : (fileExtension as 'png' | 'jpg' | 'gif' | 'bmp');

          children.push(
            new Paragraph({
              children: [
                createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 80, before: i > 0 ? 240 : 0 }
            }),
            new Paragraph({
              children: [
                createTextRun('Event Photo/Image', { color: '6b7280', italics: true })
              ],
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 500,
                    height: 400
                  },
                  type: fileType
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 240 }
            })
          );
        } else if (isWord) {
          // Handle Word documents - extract and include content
          const content = await extractAttendanceContent(file);
          
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 80, before: i > 0 ? 240 : 0 }
            }),
            new Paragraph({
              children: [
                createTextRun('Document Content', { color: '6b7280', italics: true })
              ],
              spacing: { after: 80 }
            })
          );

          // Add extracted content
          if (content && content.trim()) {
            const contentParagraphs = content.split('\n').filter(line => line.trim());
            for (const paragraph of contentParagraphs.slice(0, 20)) { // Limit to first 20 paragraphs to avoid huge documents
              children.push(
                new Paragraph({
                  children: [
                    createTextRun(paragraph.trim(), { color: '374151' })
                  ],
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 120 }
                })
              );
            }
            if (contentParagraphs.length > 20) {
              children.push(
                new Paragraph({
                  children: [
                    createTextRun('[Document content truncated for brevity. Full content available in original file.]', { color: '6b7280', italics: true })
                  ],
                  spacing: { after: 160 }
                })
              );
            }
          } else {
            children.push(
              new Paragraph({
                children: [
                  createTextRun('[Unable to extract readable content from this document]', { color: '6b7280', italics: true })
                ],
                spacing: { after: 160 }
              })
            );
          }
        } else if (isPowerPoint) {
          // Handle PowerPoint files - show placeholder
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 80, before: i > 0 ? 240 : 0 }
            }),
            new Paragraph({
              children: [
                createTextRun('📊 PowerPoint Presentation', { color: '6b7280', italics: true })
              ],
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                createTextRun(`File Size: ${(file.size / 1024).toFixed(1)}KB`, { color: '6b7280' }),
                createTextRun('\nThis PowerPoint presentation contains slides related to the event. The presentation file has been included as part of this report documentation.', { color: '374151' })
              ],
              spacing: { after: 200 }
            })
          );
        } else if (isPDF) {
          // Handle PDF files - show placeholder
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 80, before: i > 0 ? 240 : 0 }
            }),
            new Paragraph({
              children: [
                createTextRun('📄 PDF Document', { color: '6b7280', italics: true })
              ],
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                createTextRun(`File Size: ${(file.size / 1024).toFixed(1)}KB`, { color: '6b7280' }),
                createTextRun('\nThis PDF document contains additional information related to the event. The document has been included as part of this report for reference.', { color: '374151' })
              ],
              spacing: { after: 200 }
            })
          );
        } else {
          // Handle other file types
          children.push(
            new Paragraph({
              children: [
                createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
              ],
              spacing: { after: 80, before: i > 0 ? 240 : 0 }
            }),
            new Paragraph({
              children: [
                createTextRun(`📎 ${fileExtension?.toUpperCase()} File`, { color: '6b7280', italics: true })
              ],
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                createTextRun(`File Type: ${fileExtension?.toUpperCase()} | Size: ${(file.size / 1024).toFixed(1)}KB`, { color: '6b7280' }),
                createTextRun('\nThis file contains additional material related to the event and has been included as part of this report documentation.', { color: '374151' })
              ],
              spacing: { after: 200 }
            })
          );
        }
      } catch (error) {
        console.error(`Error processing miscellaneous file ${file.name}:`, error);
        children.push(
          new Paragraph({
            children: [
              createTextRun(`${i + 1}. ${file.name}`, { bold: true, color: '1f2937' })
            ],
            spacing: { after: 80, before: i > 0 ? 240 : 0 }
          }),
          new Paragraph({
            children: [
              createTextRun(`❌ Error processing ${file.name}`, { bold: true, color: 'ef4444' }),
              createTextRun('\nUnable to process this file. Please verify the file is not corrupted.', { color: '6b7280', italics: true })
            ],
            spacing: { after: 200 }
          })
        );
      }
    }

    // Border line after miscellaneous files section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '________________________________________________',
            color: 'd1d5db'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 }
      })
    );
  }

  // SIGNATURE SECTION - Exact replica with two columns
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '', break: 4 }) // Add space before signatures (mt-16)
      ],
      spacing: { before: 640 } // pt-8 = 32px + extra space
    })
  );

  // Create signature table
  const signatureRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '', break: 4 })], // Space above signature line
              spacing: { before: 640 } // mt-16 = 64px = 640 twips
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '________________________',
                  color: '6b7280' // border-gray-400
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                createTitleTextRun('Event Coordinator', { color: '1f2937' })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 }
            }),
            new Paragraph({
              children: [
                createTextRun(report.facultyCoordinators?.[0]?.name || '', { color: '374151' })
              ],
              alignment: AlignmentType.CENTER
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 }
          }
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: '', break: 4 })],
              spacing: { before: 640 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '________________________',
                  color: '6b7280'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 }
            }),
            new Paragraph({
              children: [
                createTitleTextRun('Head of Department', { color: '1f2937' })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 }
            }),
            new Paragraph({
              children: [
                createTextRun(report.organizedBy || 'Department', { color: '374151' })
              ],
              alignment: AlignmentType.CENTER
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 }
          }
        })
      ]
    })
  ];

  children.push(
    new Table({
      rows: signatureRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 }
      }
    })
  );

  // REPORT FOOTER - Exact replica
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '________________________________________________',
          color: 'd1d5db'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 320, after: 160 }
    }),

    new Paragraph({
      children: [
        createTextRun(`Report generated on ${new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })} • Birla Vishvakarma Mahavidyalaya`, { color: '9ca3af', size: 20 }) // Smaller font for footer
      ],
      alignment: AlignmentType.CENTER
    })
  );

  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906, // A4 width in twips (21cm)
            height: 16838 // A4 height in twips (29.7cm)
          },
          margin: {
            top: 1440,   // 1 inch
            right: 1440, // 1 inch  
            bottom: 1440, // 1 inch
            left: 1440   // 1 inch
          }
        }
      },
      children
    }]
  });
};

// Helper function to add content blocks exactly like HTML
const addContentBlockExactReplica = async (children: (Paragraph | Table)[], block: ContentBlock) => {
  // Image blocks - exact replica of HTML image handling
  if (block.type === 'image' && (block.imageUrls?.length || block.imageUrl)) {
    // Gray border background (exact replica of HTML)
    // children.push(
    //   new Paragraph({
    //     children: [
    //       new TextRun({
    //         text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    //         color: 'f9fafb'
    //       })
    //     ],
    //     spacing: { after: 80, before: 80 }
    //   })
    // );

    if (block.imageUrls && block.imageUrls.length > 1) {
      // Multiple images with layout
      if (block.imageLayout === 'grid') {
        // Grid layout (2 columns)
        const rows: TableRow[] = [];
        for (let i = 0; i < block.imageUrls.length; i += 2) {
          const cells = [];

          for (let j = 0; j < 2; j++) {
            const imageUrl = block.imageUrls[i + j];
            if (imageUrl) {
              try {
                const imageData = await fetchImageAsArrayBuffer(imageUrl);
                const imageType = getImageType(imageUrl);
                cells.push(
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: imageData,
                            transformation: {
                              width: 250,
                              height: 192 // h-48 = 192px
                            },
                            type: imageType
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                );
              } catch {
                cells.push(
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          createTextRun('[Image could not be loaded]', { italics: true, color: '6b7280' })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                );
              }
            } else {
              cells.push(
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                })
              );
            }
          }

          rows.push(new TableRow({ children: cells }));
        }

        children.push(
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 }
            }
          })
        );
      } else if (block.imageLayout === 'row') {
        // Row layout (3 columns)
        const cells = [];
        for (const imageUrl of block.imageUrls) {
          try {
            const imageData = await fetchImageAsArrayBuffer(imageUrl);
            const imageType = getImageType(imageUrl);
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageData,
                        transformation: {
                          width: 160,
                          height: 128 // h-32 = 128px
                        },
                        type: imageType
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ],
                width: { size: 100 / block.imageUrls.length, type: WidthType.PERCENTAGE }
              })
            );
          } catch {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '[Image could not be loaded]',
                        italics: true,
                        size: 20,
                        color: '6b7280'
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ],
                width: { size: 100 / block.imageUrls.length, type: WidthType.PERCENTAGE }
              })
            );
          }
        }

        children.push(
          new Table({
            rows: [new TableRow({ children: cells })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
              insideHorizontal: { style: BorderStyle.NONE, size: 0 },
              insideVertical: { style: BorderStyle.NONE, size: 0 }
            }
          })
        );
      } else {
        // Single column layout
        for (const imageUrl of block.imageUrls) {
          try {
            const imageData = await fetchImageAsArrayBuffer(imageUrl);
            const imageType = getImageType(imageUrl);
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData,
                    transformation: {
                      width: 500,
                      height: 350
                    },
                    type: imageType
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 }
              })
            );
          } catch {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '[Image could not be loaded]',
                    italics: true,
                    size: 28,
                    color: '6b7280'
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 }
              })
            );
          }
        }
      }
    } else {
      // Single image
      const imageUrl = block.imageUrls?.[0] || block.imageUrl;
      if (imageUrl) {
        try {
          const imageData = await fetchImageAsArrayBuffer(imageUrl);
          const imageType = getImageType(imageUrl);
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 500,
                    height: 350
                  },
                  type: imageType
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 }
            })
          );
        } catch {
          children.push(
            new Paragraph({
              children: [
                createTextRun('[Image could not be loaded]', { italics: true, color: '6b7280' })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 }
            })
          );
        }
      }
    }

    // End gray border
    // children.push(
    //   new Paragraph({
    //     children: [
    //       new TextRun({
    //         text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    //         color: 'f9fafb'
    //       })
    //     ],
    //     spacing: { after: 80 }
    //   })
    // );

    // Caption and credit exactly like HTML
    if (block.caption) {
      children.push(
        new Paragraph({
          children: [
            createTextRun(block.caption, { bold: true, color: '374151' })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 }
        })
      );
    }

    if (block.credit) {
      children.push(
        new Paragraph({
          children: [
            createTextRun(`Photo Credit: ${block.credit}`, { color: '6b7280', size: 20 })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 80 }
        })
      );
    }
  }

  // Quote blocks - exact replica with border
  if (block.type === 'quote' && block.content) {
    children.push(
      new Paragraph({
        children: [
          createTextRun('│', { bold: true, color: '9ca3af', size: 32 }),
          createTextRun('   💬   ', { size: 28 }),
          createTextRun(`"${block.content}"`, { italics: true, bold: true, color: '1f2937', size: 28 })
        ],
        spacing: { after: 120, before: 120 }
      })
    );
  }

  // Text and achievement blocks
  if ((block.type === 'text' || block.type === 'achievement') && block.content) {
    children.push(
      new Paragraph({
        children: [
          createTextRun(block.content, { color: '374151' })
        ],
        alignment: AlignmentType.BOTH,
        spacing: { after: 120 }
      })
    );
  }
};
