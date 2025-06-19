'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

// Need to run the migration first to have ProjectFile model available
// This is a temporary workaround until the migration is applied
type ProjectFile = {
    id: string;
    projectId: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    publicId: string;
    uploadedById: string;
    createdAt: Date;
    uploadedBy?: {
        name: string | null;
        email: string;
        clerkId: string;
    };
    project?: any;
};

export async function uploadProjectFile(formData: FormData) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Get the file from the form data
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;

        // Validate file
        if (!file) {
            return { error: 'No file provided' };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { error: 'File size exceeds the 5MB limit' };
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return { error: 'File type not allowed. Please upload JPG, PNG, PDF, or Excel files' };
        }

        // Check if project exists and user has access
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                team: {
                    members: {
                        some: {
                            user: { clerkId: user.id }
                        }
                    }
                }
            }
        });

        if (!project) {
            return { error: 'Project not found or you do not have access' };
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            return { error: 'User not found' };
        }

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Determine file type category
        let fileType = 'document';
        if (file.type.startsWith('image/')) {
            fileType = 'image';
        } else if (file.type === 'application/pdf') {
            fileType = 'pdf';
        } else if (file.type === 'application/vnd.ms-excel' ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            fileType = 'excel';
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: `project-files/${projectId}`,
            public_id: `${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
            overwrite: true
        });

        // Save file information to database
        const projectFile = await prisma.$queryRaw`
            INSERT INTO "ProjectFile" ("id", "projectId", "fileUrl", "fileName", "fileType", "fileSize", "publicId", "uploadedById", "createdAt")
            VALUES (gen_random_uuid(), ${projectId}, ${uploadResult.secure_url}, ${file.name}, ${fileType}, ${file.size}, ${uploadResult.public_id}, ${dbUser.id}, NOW())
            RETURNING "id", "fileUrl", "fileName", "fileType", "publicId"
        ` as any;

        // Revalidate the project page
        revalidatePath(`/dashboard/projects/${projectId}`);

        return {
            success: true,
            file: {
                id: projectFile[0].id,
                fileUrl: projectFile[0].fileUrl,
                fileName: projectFile[0].fileName,
                fileType: projectFile[0].fileType,
                publicId: projectFile[0].publicId
            }
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { error: 'Failed to upload file' };
    }
}

export async function deleteProjectFile(fileId: string) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Get the file from the database
        const file = await prisma.$queryRaw`
      SELECT f.*, u.name as "uploaderName", u.email as "uploaderEmail", u."clerkId" as "uploaderClerkId"
      FROM "ProjectFile" f
      JOIN "User" u ON f."uploadedById" = u.id
      WHERE f.id = ${fileId}
    ` as any[];

        if (!file || file.length === 0) {
            return { error: 'File not found' };
        }

        const fileData = file[0];

        // Get team member role
        const teamMember = await prisma.$queryRaw`
      SELECT tm.role
      FROM "TeamMember" tm
      JOIN "Project" p ON tm."teamId" = p."teamId"
      JOIN "User" u ON tm."userId" = u.id
      WHERE p.id = ${fileData.projectId}
      AND u."clerkId" = ${user.id}
    ` as any[];

        // Check if user has permission to delete the file
        const isTeamMember = teamMember && teamMember.length > 0;
        const isOwnerOrManager = isTeamMember && teamMember.some(
            (member: { role: string }) => ['OWNER', 'MANAGER'].includes(member.role)
        );
        const isUploader = fileData.uploaderClerkId === user.id;

        if (!isTeamMember || (!isOwnerOrManager && !isUploader)) {
            return { error: 'You do not have permission to delete this file' };
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(fileData.publicId);

        // Delete from database
        await prisma.$executeRaw`DELETE FROM "ProjectFile" WHERE id = ${fileId}`;

        // Revalidate the project page
        revalidatePath(`/dashboard/projects/${fileData.projectId}`);

        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { error: 'Failed to delete file' };
    }
}

export async function getProjectFiles(projectId: string) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Check if project exists and user has access
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                team: {
                    members: {
                        some: {
                            user: { clerkId: user.id }
                        }
                    }
                }
            }
        });

        if (!project) {
            return { error: 'Project not found or you do not have access' };
        }

        // Get files for the project
        const files = await prisma.$queryRaw`
      SELECT f.*, u.name as "uploaderName", u.email as "uploaderEmail"
      FROM "ProjectFile" f
      JOIN "User" u ON f."uploadedById" = u.id
      WHERE f."projectId" = ${projectId}
      ORDER BY f."createdAt" DESC
    ` as any[];

        return {
            success: true,
            files: files.map((file: any) => ({
                id: file.id,
                fileUrl: file.fileUrl,
                fileName: file.fileName,
                fileType: file.fileType,
                fileSize: file.fileSize,
                publicId: file.publicId,
                uploadedBy: file.uploaderName || file.uploaderEmail,
                createdAt: file.createdAt
            }))
        };
    } catch (error) {
        console.error('Error fetching project files:', error);
        return { error: 'Failed to fetch project files' };
    }
} 