'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Bold,
    Italic,
    Link as LinkIcon,
    Image as ImageIcon,
    List,
    ListOrdered,
    AtSign,
    X
} from 'lucide-react'

interface User {
    id: string
    name: string | null
    email: string
}

interface RichTextEditorProps {
    placeholder?: string
    content?: string
    onChange: (html: string) => void
    users?: User[]
    onMention?: (userId: string) => void
    onUploadImage?: (file: File) => Promise<string>
    className?: string
    minHeight?: string
}

export function RichTextEditor({
    placeholder = 'Write something...',
    content = '',
    onChange,
    users = [],
    onMention,
    onUploadImage,
    className = '',
    minHeight = '150px'
}: RichTextEditorProps) {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [showMentionMenu, setShowMentionMenu] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [isMounted, setIsMounted] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-md max-w-full h-auto',
                },
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention',
                },
                suggestion: {
                    items: ({ query }) => {
                        setMentionQuery(query)
                        return users
                            .filter(user =>
                            (user.name?.toLowerCase().includes(query.toLowerCase()) ||
                                user.email.toLowerCase().includes(query.toLowerCase())))
                            .slice(0, 5)
                    },
                    render: () => {
                        return {
                            onStart: () => {
                                setShowMentionMenu(true)
                            },
                            onUpdate: ({ items }: { items: User[] }) => {
                                setSelectedUsers(items)
                            },
                            onExit: () => {
                                setShowMentionMenu(false)
                            },
                            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
                                // Handle keyboard navigation here if needed
                                return false
                            }
                        }
                    }
                }
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none',
            },
        },
        immediatelyRender: false,
    })

    // Client-side only
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Handle mention selection
    const handleMentionSelect = (user: User) => {
        if (editor && onMention) {
            editor.chain().focus().insertContent(`@${user.name || user.email} `).run()
            onMention(user.id)
            setShowMentionMenu(false)
        }
    }

    // Handle image upload
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor || !onUploadImage) return

        const files = e.target.files
        if (!files || files.length === 0) return

        try {
            const file = files[0]
            const url = await onUploadImage(file)

            if (url) {
                editor.chain().focus().setImage({ src: url }).run()
            }
        } catch (error) {
            console.error('Failed to upload image:', error)
        }

        // Reset the input
        e.target.value = ''
    }, [editor, onUploadImage])

    if (!editor || !isMounted) {
        return <div style={{ minHeight }} className={`border rounded-md ${className}`} />
    }

    return (
        <div className={`border rounded-md ${className}`}>
            <div className="flex items-center gap-1 p-2 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className={`h-8 w-8 ${editor.isActive('link') ? 'bg-muted' : ''}`}
                            title="Add Link"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">Add Link</p>
                            <input
                                type="text"
                                placeholder="Paste or type link..."
                                className="border rounded p-2 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.currentTarget
                                        if (input.value) {
                                            editor.chain().focus().setLink({ href: input.value }).run()
                                            input.value = ''
                                            document.body.click() // Close popover
                                        }
                                    }
                                }}
                            />
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                        if (editor.isActive('link')) {
                                            editor.chain().focus().unsetLink().run()
                                        }
                                        document.body.click() // Close popover
                                    }}
                                >
                                    {editor.isActive('link') ? 'Remove Link' : 'Cancel'}
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {onUploadImage && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="h-8 w-8 relative"
                        title="Add Image"
                        onClick={() => document.getElementById('image-upload')?.click()}
                    >
                        <ImageIcon className="h-4 w-4" />
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                        />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => editor.chain().focus().insertContent('@').run()}
                    className="h-8 w-8"
                    title="Mention User"
                >
                    <AtSign className="h-4 w-4" />
                </Button>
            </div>

            {showMentionMenu && selectedUsers.length > 0 && (
                <div className="absolute z-10 bg-white shadow-md rounded-md border p-1 mt-1 max-h-60 overflow-y-auto">
                    <div className="flex justify-between items-center px-2 py-1 border-b">
                        <span className="text-xs font-medium text-gray-500">Mention a user</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-5 w-5"
                            onClick={() => setShowMentionMenu(false)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="py-1">
                        {selectedUsers.map(user => (
                            <div
                                key={user.id}
                                className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => handleMentionSelect(user)}
                            >
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback>
                                        {user.name
                                            ? user.name.split(' ').map(n => n[0]).join('')
                                            : user.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium">{user.name || 'Unnamed'}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <EditorContent
                editor={editor}
                className="p-3 prose max-w-none focus:outline-none"
                style={{ minHeight }}
            />
        </div>
    )
} 