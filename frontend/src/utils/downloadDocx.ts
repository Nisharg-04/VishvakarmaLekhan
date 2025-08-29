import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle, UnderlineType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { EventReport, ContentBlock } from '../store/reportStore';

// Helper function to get image type from URL or data
const getImageType = (imageUrl: string): 'png' | 'jpg' | 'gif' | 'bmp' => {
  if (imageUrl.startsWith('data:image/')) {
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    const type = mimeType.split('/')[1];
    if (type === 'jpeg') return 'jpg';
    if (['png', 'jpg', 'gif', 'bmp'].includes(type)) {
      return type as 'png' | 'jpg' | 'gif' | 'bmp';
    }
    return 'png'; // Default fallback
  }
  
  // Extract extension from URL
  const extension = imageUrl.split('.').pop()?.toLowerCase();
  if (extension === 'jpeg') return 'jpg';
  if (['png', 'jpg', 'gif', 'bmp'].includes(extension || '')) {
    return extension as 'png' | 'jpg' | 'gif' | 'bmp';
  }
  return 'png'; // Default fallback
};

// Helper function to fetch image from URL and convert to array buffer
const fetchImageAsArrayBuffer = async (imageUrl: string): Promise<ArrayBuffer> => {
  try {
    // Handle data URLs (base64 images)
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    
    // Handle regular URLs
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

// Helper function to get logo image data
const getLogoImageData = async (logoName: string): Promise<ArrayBuffer | null> => {
  try {
    // Map logo names to their actual file paths in public folder
    const logoMap: Record<string, string> = {
      'BVM': '/BVM Logo-1.png',
      'GTU': '/GTU.png',
      'NSS': '/nss.png',
      'IEEE': '/IEEE BVM SB.png',
      'CSI': '/CSI.jpeg',
      'BYTE': '/BYTE.jpeg'
    };

    const logoPath = logoMap[logoName];
    if (!logoPath) {
      console.error(`Logo not found in mapping: ${logoName}`);
      return null;
    }

    const logoUrl = window.location.origin + logoPath;
    console.log(`Attempting to fetch logo from: ${logoUrl}`);
    return await fetchImageAsArrayBuffer(logoUrl);
  } catch (error) {
    console.error(`Failed to load logo ${logoName}:`, error);
    return null;
  }
};

// Helper function to process attendance sheet
const processAttendanceSheet = async (attendanceSheet: File | string): Promise<ArrayBuffer | null> => {
  try {
    if (typeof attendanceSheet === 'string') {
      // Handle URL or base64 string
      return await fetchImageAsArrayBuffer(attendanceSheet);
    } else {
      // Handle File object
      return await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(attendanceSheet);
      });
    }
  } catch (error) {
    console.error('Failed to process attendance sheet:', error);
    return null;
  }
};

export const downloadReportAsDocx = async (report: EventReport, customFileName?: string) => {
  try {
    const doc = await createProfessionalWordDocument(report);
    
    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const fileName = customFileName 
      ? `${customFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`
      : `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};

const createProfessionalWordDocument = async (report: EventReport): Promise<Document> => {
  // Helper function to create consistent text formatting
  const createTextRun = (text: string, options: { bold?: boolean; italics?: boolean; size?: number; color?: string; underline?: boolean } = {}) => {
    const textRunOptions: Record<string, unknown> = {
      text,
      font: 'Times New Roman',
      size: options.size || 24, // Default to size 12 (12 * 2 = 24 half-points)
      bold: options.bold || false,
      italics: options.italics || false,
      color: options.color || '000000'
    };
    
    if (options.underline) {
      textRunOptions.underline = { type: UnderlineType.SINGLE };
    }
    
    return new TextRun(textRunOptions);
  };

  const createTitleTextRun = (text: string, options: { color?: string; underline?: boolean } = {}) => {
    return createTextRun(text, { bold: true, size: 22 , ...options }); // Size 14 * 2 = 28
  };

  // Create document sections with mixed content (paragraphs, tables, etc.)
  const documentChildren = [];

  // Add logos section if any logos are selected
  if (report.selectedLogos && report.selectedLogos.length > 0) {
    console.log('Processing logos:', report.selectedLogos);
    const logoChildren = [];
    
    for (const logoName of report.selectedLogos) {
      try {
        console.log(`Loading logo: ${logoName}`);
        const logoData = await getLogoImageData(logoName);
        if (logoData) {
          console.log(`Successfully loaded logo: ${logoName}`);
          // Determine logo type based on file extension
          const logoExtensions: Record<string, 'png' | 'jpg'> = {
            'BVM': 'png',
            'GTU': 'png',
            'NSS': 'png',
            'IEEE': 'png',
            'CSI': 'jpg',
            'BYTE': 'jpg'
          };
          
          logoChildren.push(
            new ImageRun({
              data: logoData,
              transformation: {
                width: 120,
                height: 120
              },
              type: logoExtensions[logoName] || 'png'
            })
          );
          
          // Add some space between logos
          if (logoName !== report.selectedLogos[report.selectedLogos.length - 1]) {
            logoChildren.push(new TextRun({ text: '   ' }));
          }
        }
      } catch (error) {
        console.warn(`Failed to load logo ${logoName}:`, error);
        // Add text placeholder if image fails to load
        logoChildren.push(
          new TextRun({
            text: `[${logoName} Logo]`,
            bold: true,
            size: 16,
            color: '6b7280'
          })
        );
      }
    }

    if (logoChildren.length > 0) {
      documentChildren.push(
        new Paragraph({
          children: logoChildren,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }
  }

  // Title section
  documentChildren.push(
    new Paragraph({
      children: [
        createTitleTextRun('BIRLA VISHVAKARMA MAHAVIDYALAYA ENGINEERING COLLEGE', { color: '1f2937' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        createTextRun('V.V.Nagar, Anand-388120, Gujarat, India', { color: '6b7280' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  // Event title
  documentChildren.push(
    new Paragraph({
      children: [
        createTitleTextRun('EVENT REPORT', { color: '1f2937', underline: true })
      ],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      children: [
        createTitleTextRun(report.title.toUpperCase(), { color: '3b82f6' })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  if (report.tagline) {
    documentChildren.push(
      new Paragraph({
        children: [
          createTextRun(`"${report.tagline}"`, { italics: true, color: '6b7280' })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );
  }

  // Event details table
  const eventDetailsRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [createTextRun('Event Date', { bold: true })] })],
          shading: { fill: 'f3f4f6' }
        }),
        new TableCell({
          children: [new Paragraph({ 
            children: [createTextRun(`${new Date(report.startDate).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}${report.endDate ? ` to ${new Date(report.endDate).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}` : ''}`)] 
          })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [createTextRun('Venue', { bold: true })] })],
          shading: { fill: 'f3f4f6' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTextRun(report.venue || 'Not specified')] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [createTextRun('Event Type', { bold: true })] })],
          shading: { fill: 'f3f4f6' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTextRun(report.eventType || 'Not specified')] })]
        })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [createTextRun('Organized By', { bold: true })] })],
          shading: { fill: 'f3f4f6' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTextRun(report.organizedBy || 'Not specified')] })]
        })
      ]
    })
  ];

  if (report.targetAudience) {
    eventDetailsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [createTextRun('Target Audience', { bold: true })] })],
            shading: { fill: 'f3f4f6' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [createTextRun(report.targetAudience)] })]
          })
        ]
      })
    );
  }

  if (report.participantCount) {
    eventDetailsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [createTextRun('No. of Participants', { bold: true })] })],
            shading: { fill: 'f3f4f6' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [createTextRun(report.participantCount.toString())] })]
          })
        ]
      })
    );
  }

  if (report.academicYear) {
    eventDetailsRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [createTextRun('Academic Year', { bold: true })] })],
            shading: { fill: 'f3f4f6' }
          }),
          new TableCell({
            children: [new Paragraph({ children: [createTextRun(report.academicYear)] })]
          })
        ]
      })
    );
  }

  documentChildren.push(
    new Table({
      rows: eventDetailsRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    })
  );

  // People Involved Section
  if (report.facultyCoordinators?.length || report.studentCoordinators?.length || report.chiefGuest?.name) {
    documentChildren.push(
      new Paragraph({
        children: [
          createTitleTextRun('PEOPLE INVOLVED', { color: '1f2937' })
        ],
        alignment: AlignmentType.LEFT,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    // Faculty Coordinators
    if (report.facultyCoordinators?.length) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Faculty Coordinators:',
              bold: true,
              size: 22,
              color: '374151'
            })
          ],
          spacing: { before: 200, after: 100 }
        })
      );

      report.facultyCoordinators.forEach((coordinator, index) => {
        if (coordinator.name) {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${coordinator.name}${coordinator.designation ? `, ${coordinator.designation}` : ''}${coordinator.email ? ` (${coordinator.email})` : ''}`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            })
          );
        }
      });
    }

    // Student Coordinators
    if (report.studentCoordinators?.length) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Student Coordinators:',
              bold: true,
              size: 22,
              color: '374151'
            })
          ],
          spacing: { before: 200, after: 100 }
        })
      );

      report.studentCoordinators.forEach((coordinator, index) => {
        if (coordinator.name) {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${coordinator.name}${coordinator.rollNo ? ` (${coordinator.rollNo})` : ''}${coordinator.contact ? ` - ${coordinator.contact}` : ''}`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            })
          );
        }
      });
    }

    // Chief Guest
    if (report.chiefGuest?.name) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Chief Guest/Speaker:',
              bold: true,
              size: 22,
              color: '374151'
            })
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${report.chiefGuest.name}${report.chiefGuest.designation ? `, ${report.chiefGuest.designation}` : ''}${report.chiefGuest.affiliation ? `, ${report.chiefGuest.affiliation}` : ''}`,
              size: 20
            })
          ],
          spacing: { after: 100 }
        })
      );
    }

    // Additional people
    if (report.hostedBy) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Hosted By: ',
              bold: true,
              size: 20
            }),
            new TextRun({
              text: report.hostedBy,
              size: 20
            })
          ],
          spacing: { before: 100, after: 100 }
        })
      );
    }

    if (report.guestsOfHonor) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Guests of Honor: ',
              bold: true,
              size: 20
            }),
            new TextRun({
              text: report.guestsOfHonor,
              size: 20
            })
          ],
          spacing: { after: 100 }
        })
      );
    }
  }

  // Content blocks
  if (report.contentBlocks && report.contentBlocks.length > 0) {
    documentChildren.push(
      new Paragraph({
        children: [
          createTitleTextRun('EVENT DETAILS', { color: '1f2937' })
        ],
        alignment: AlignmentType.LEFT,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      })
    );

    for (const block of report.contentBlocks) {
      await addContentBlockToDocument(documentChildren, block);
    }
  }

  // Generated content - only for summary reports (reports with no content blocks)
  if (report.generatedContent && (!report.contentBlocks || report.contentBlocks.length === 0)) {
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXECUTIVE SUMMARY',
            bold: true,
            size: 24,
            color: '1f2937'
          })
        ],
        alignment: AlignmentType.LEFT,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: report.generatedContent,
            size: 22,
            color: '374151'
          })
        ],
        spacing: { after: 300 }
      })
    );
  }

  // Special mentions
  if (report.specialMentions) {
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SPECIAL MENTIONS',
            bold: true,
            size: 24,
            color: '1f2937'
          })
        ],
        alignment: AlignmentType.LEFT,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: report.specialMentions,
            size: 22,
            color: '374151'
          })
        ],
        spacing: { after: 300 }
      })
    );
  }

  // Attendance Sheet
  if (report.attendanceSheet) {
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ATTENDANCE SHEET',
            bold: true,
            size: 24,
            color: '1f2937'
          })
        ],
        alignment: AlignmentType.LEFT,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    try {
      const attendanceData = await processAttendanceSheet(report.attendanceSheet);
      if (attendanceData) {
        // Determine file type
        let fileType: 'png' | 'jpg' | 'gif' | 'bmp' = 'png';
        if (typeof report.attendanceSheet === 'string') {
          fileType = getImageType(report.attendanceSheet);
        } else if (report.attendanceSheet instanceof File) {
          const extension = report.attendanceSheet.name.split('.').pop()?.toLowerCase();
          if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(extension || '')) {
            fileType = extension === 'jpeg' ? 'jpg' : (extension as 'png' | 'jpg' | 'gif' | 'bmp');
          }
        }

        if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(fileType)) {
          // Handle as image
          documentChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: attendanceData,
                  transformation: {
                    width: 500,
                    height: 600
                  },
                  type: fileType
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 }
            })
          );
        } else {
          // Handle as non-image file (PDF, Excel, etc.)
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[Attendance Sheet: ${typeof report.attendanceSheet === 'string' ? 'File' : report.attendanceSheet.name}]`,
                  bold: true,
                  size: 18,
                  color: '3b82f6'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Note: The attendance sheet file has been attached but cannot be displayed inline. Please refer to the original file for attendance details.',
                  italics: true,
                  size: 16,
                  color: '6b7280'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            })
          );
        }
      }
    } catch (error) {
      console.warn('Failed to process attendance sheet:', error);
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '[Attendance Sheet could not be processed]',
              italics: true,
              size: 18,
              color: '6b7280'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 }
        })
      );
    }
  }

  // Signature section
  documentChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'SIGNATURES',
          bold: true,
          size: 24,
          color: '1f2937'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 400 },
      pageBreakBefore: true
    })
  );

  // Create signature table
  const signatureRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Faculty Coordinator', bold: true })],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({
              children: [new TextRun({ text: '_________________________' })],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: report.facultyCoordinators?.[0]?.name || 'Name', 
                size: 18 
              })],
              alignment: AlignmentType.CENTER
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Head of Department', bold: true })],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            new Paragraph({
              children: [new TextRun({ text: '_________________________' })],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Dr. [HOD Name]', size: 18 })],
              alignment: AlignmentType.CENTER
            })
          ],
          width: { size: 50, type: WidthType.PERCENTAGE }
        })
      ]
    })
  ];

  documentChildren.push(
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

  // Document footer
  documentChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated on ${new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} | Birla Vishvakarma Mahavidyalaya Engineering College`,
          size: 16,
          color: '9ca3af',
          italics: true
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 }
    })
  );

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,    // 0.5 inch
            right: 720,  // 0.5 inch
            bottom: 720, // 0.5 inch
            left: 720    // 0.5 inch
          }
        }
      },
      children: documentChildren
    }]
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addContentBlockToDocument = async (children: any[], block: ContentBlock) => {
  // Add block title
  if (block.title) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: block.title,
            bold: true,
            size: 22,
            color: '374151'
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      })
    );
  }

  // Handle different block types
  switch (block.type) {
    case 'text':
      if (block.content) {
        const paragraphs = block.content.split('\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: 20,
                  color: '4b5563'
                })
              ],
              spacing: { after: 150 }
            })
          );
        });
      }
      break;

    case 'image':
      // Handle multiple images with different layouts
      if (block.imageUrls && block.imageUrls.length > 0) {
        const layout = block.imageLayout || 'single';
        
        if (layout === 'grid' && block.imageUrls.length > 1) {
          // Create a grid layout using a table
          const rows: TableRow[] = [];
          const imagesPerRow = Math.ceil(Math.sqrt(block.imageUrls.length));
          
          for (let i = 0; i < block.imageUrls.length; i += imagesPerRow) {
            const rowImages = block.imageUrls.slice(i, i + imagesPerRow);
            const cells = [];
            
            for (const imageUrl of rowImages) {
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
                              width: 200,
                              height: 150
                            },
                            type: imageType
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                    ],
                    width: { size: 100 / rowImages.length, type: WidthType.PERCENTAGE }
                  })
                );
              } catch (error) {
                console.warn('Failed to embed image:', error);
                cells.push(
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '[Image could not be loaded]',
                            italics: true,
                            size: 16,
                            color: '6b7280'
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                    ],
                    width: { size: 100 / rowImages.length, type: WidthType.PERCENTAGE }
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
        } else if (layout === 'row' && block.imageUrls.length > 1) {
          // Create a row layout using a single-row table
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
                            width: 300 / block.imageUrls.length,
                            height: 200
                          },
                          type: imageType
                        })
                      ],
                      alignment: AlignmentType.CENTER,
                    })
                  ],
                  width: { size: 100 / block.imageUrls.length, type: WidthType.PERCENTAGE }
                })
              );
            } catch (error) {
              console.warn('Failed to embed image:', error);
              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '[Image could not be loaded]',
                          italics: true,
                          size: 16,
                          color: '6b7280'
                        })
                      ],
                      alignment: AlignmentType.CENTER,
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
          // Single column layout (default)
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
                        width: 400,
                        height: 300
                      },
                      type: imageType
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 150, after: 150 }
                })
              );
            } catch (error) {
              console.warn('Failed to embed image:', error);
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '[Image could not be loaded]',
                      italics: true,
                      size: 18,
                      color: '6b7280'
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 150, after: 150 }
                })
              );
            }
          }
        }
      } else if (block.imageUrl) {
        try {
          const imageData = await fetchImageAsArrayBuffer(block.imageUrl);
          const imageType = getImageType(block.imageUrl);
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 400,
                    height: 300
                  },
                  type: imageType
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 150, after: 150 }
            })
          );
        } catch (error) {
          console.warn('Failed to embed image:', error);
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '[Image could not be loaded]',
                  italics: true,
                  size: 18,
                  color: '6b7280'
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 150, after: 150 }
            })
          );
        }
      }

      // Add caption if present
      if (block.caption) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.caption,
                italics: true,
                size: 18,
                color: '6b7280'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 }
          })
        );
      }

      // Add credit if present
      if (block.credit) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Photo Credit: ${block.credit}`,
                size: 16,
                color: '9ca3af',
                italics: true
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 }
          })
        );
      }
      break;

    case 'quote':
      if (block.content) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `"${block.content}"`,
                italics: true,
                size: 20,
                color: '3b82f6'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
          })
        );
      }
      break;

    case 'achievement':
      if (block.content) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `🏆 ${block.content}`,
                bold: true,
                size: 20,
                color: '059669'
              })
            ],
            spacing: { before: 150, after: 150 }
          })
        );
      }
      break;

    default:
      if (block.content) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                size: 20,
                color: '4b5563'
              })
            ],
            spacing: { after: 150 }
          })
        );
      }
      break;
  }
};