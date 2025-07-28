'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Interface for comment data
interface CommentData {
    content: string;
    taskId: string;
    mentionedUserIds?: string[];
}

// Add a new comment to a task
export async function addTaskComment(data: CommentData) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            return { error: 'User not found' };
        }

        // Check if task exists and user has access
        const task = await prisma.task.findFirst({
            where: {
                id: data.taskId,
                project: {
                    team: {
                        members: {
                            some: {
                                user: { clerkId: user.id }
                            }
                        }
                    }
                }
            }
        });

        if (!task) {
            return { error: 'Task not found or you do not have access' };
        }

        // Create the comment
        const comment = await prisma.taskComment.create({
            data: {
                content: data.content,
                taskId: data.taskId,
                authorId: dbUser.id
            }
        });

        // Process mentions if any
        if (data.mentionedUserIds && data.mentionedUserIds.length > 0) {
            // Create mentions
            await Promise.all(
                data.mentionedUserIds.map(userId =>
                    prisma.taskCommentMention.create({
                        data: {
                            commentId: comment.id,
                            userId
                        }
                    })
                )
            );
        }

        // Revalidate the task page
        revalidatePath(`/dashboard/tasks/${data.taskId}`);

        return { success: true, commentId: comment.id };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { error: 'Failed to add comment' };
    }
}

// Upload an attachment for a comment
export async function uploadCommentAttachment(formData: FormData) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Get the file from the form data
        const file = formData.get('file') as File;
        const commentId = formData.get('commentId') as string;

        // Validate file
        if (!file) {
            return { error: 'No file provided' };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { error: 'File size exceeds the 10MB limit' };
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return { error: 'File type not allowed' };
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            return { error: 'User not found' };
        }

        // Check if comment exists and user has access
        const comment = await prisma.taskComment.findFirst({
            where: {
                id: commentId,
                authorId: dbUser.id
            },
            include: {
                task: {
                    include: {
                        project: true
                    }
                }
            }
        });

        if (!comment) {
            return { error: 'Comment not found or you do not have access' };
        }

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Determine file type category
        let fileType = 'document';
        if (file.type.startsWith('image/')) {
            fileType = 'image';
        } else if (file.type.startsWith('video/')) {
            fileType = 'video';
        } else if (file.type === 'application/pdf') {
            fileType = 'pdf';
        } else if (file.type === 'application/vnd.ms-excel' ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            fileType = 'excel';
        } else if (file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            fileType = 'word';
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: `task-comments/${comment.taskId}`,
            public_id: `${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
            overwrite: true
        });

        // Save attachment information to database
        const attachment = await prisma.taskCommentAttachment.create({
            data: {
                commentId,
                fileUrl: uploadResult.secure_url,
                fileName: file.name,
                fileType,
                fileSize: file.size,
                publicId: uploadResult.public_id
            }
        });

        // Revalidate the task page
        revalidatePath(`/dashboard/tasks/${comment.taskId}`);

        return {
            success: true,
            attachment: {
                id: attachment.id,
                fileUrl: attachment.fileUrl,
                fileName: attachment.fileName,
                fileType: attachment.fileType
            }
        };
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return { error: 'Failed to upload attachment' };
    }
}

// Delete a comment
export async function deleteTaskComment(commentId: string) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            return { error: 'User not found' };
        }

        // Get the comment with task information
        const comment = await prisma.taskComment.findUnique({
            where: { id: commentId },
            include: {
                task: {
                    include: {
                        project: {
                            include: {
                                team: {
                                    include: {
                                        members: {
                                            where: {
                                                userId: dbUser.id
                                            },
                                            select: {
                                                role: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                attachments: true
            }
        });

        if (!comment) {
            return { error: 'Comment not found' };
        }

        // Check if user has permission to delete the comment
        const isAuthor = comment.authorId === dbUser.id;
        const teamMember = comment.task.project.team.members[0];
        const isTeamAdmin = teamMember && ['OWNER', 'MANAGER'].includes(teamMember.role);

        if (!isAuthor && !isTeamAdmin) {
            return { error: 'You do not have permission to delete this comment' };
        }

        // Delete attachments from Cloudinary
        if (comment.attachments.length > 0) {
            await Promise.all(
                comment.attachments.map(attachment =>
                    cloudinary.uploader.destroy(attachment.publicId)
                )
            );
        }

        // Delete the comment (will cascade delete attachments and mentions)
        await prisma.taskComment.delete({
            where: { id: commentId }
        });

        // Revalidate the task page
        revalidatePath(`/dashboard/tasks/${comment.task.id}`);

        return { success: true };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { error: 'Failed to delete comment' };
    }
}

// Get comments for a task
export async function getTaskComments(taskId: string) {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Check if task exists and user has access
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                project: {
                    team: {
                        members: {
                            some: {
                                user: { clerkId: user.id }
                            }
                        }
                    }
                }
            }
        });

        if (!task) {
            return { error: 'Task not found or you do not have access' };
        }

        // Get comments for the task
        const comments = await prisma.taskComment.findMany({
            where: { taskId },
            include: {
                author: true,
                attachments: true,
                mentions: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return {
            success: true,
            comments: comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                author: {
                    id: comment.author.id,
                    name: comment.author.name,
                    email: comment.author.email
                },
                attachments: comment.attachments.map(attachment => ({
                    id: attachment.id,
                    fileUrl: attachment.fileUrl,
                    fileName: attachment.fileName,
                    fileType: attachment.fileType
                })),
                mentions: comment.mentions.map(mention => ({
                    id: mention.id,
                    user: {
                        id: mention.user.id,
                        name: mention.user.name,
                        email: mention.user.email
                    }
                })),
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            }))
        };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { error: 'Failed to fetch comments' };
    }
} 