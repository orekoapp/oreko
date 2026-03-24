'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useLogoUpload() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Cleanup blob URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG and JPG images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      if (logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return {
    logoUrl,
    isUploadingLogo,
    handleLogoUpload,
  };
}
