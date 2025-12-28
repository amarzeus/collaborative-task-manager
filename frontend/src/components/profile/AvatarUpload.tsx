/**
 * AvatarUpload Component
 * Allows users to upload and delete their avatar
 */

import { useState, useRef } from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { uploadApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export function AvatarUpload() {
    const { user, updateUser } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be smaller than 2MB');
            return;
        }

        setError(null);
        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            setError(null);

            const data = await uploadApi.uploadAvatar(selectedFile);

            // Update user in auth context
            if (user) {
                updateUser({ ...user, avatarUrl: data.avatarUrl });
            }

            // Clear preview
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (!user?.avatarUrl) return;

        try {
            setIsDeleting(true);
            setError(null);

            await uploadApi.deleteAvatar();

            // Update user in auth context
            if (user) {
                updateUser({ ...user, avatarUrl: undefined });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete avatar');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col items-center gap-4">
            <Avatar
                src={previewUrl || user.avatarUrl}
                name={user.name}
                size="xl"
                className={`ring-4 ${previewUrl ? 'ring-indigo-500 animate-pulse' : 'ring-slate-800'}`}
            />

            {error && (
                <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    {error}
                </p>
            )}

            {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                            onClick={handleSave}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Upload className="w-4 h-4" />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isDeleting}
                    >
                        Change Photo
                    </Button>

                    {user.avatarUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            onClick={handleDelete}
                            disabled={isUploading || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Remove'}
                        </Button>
                    )}
                </div>
            )}

            <p className="text-xs text-slate-500 text-center">
                JPG, PNG or GIF. Max size 2MB.
            </p>
        </div>
    );
}
