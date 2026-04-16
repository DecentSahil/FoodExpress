import React, { useEffect, useState } from 'react';

/**
 * Fetches an image with an Authorization header and renders it.
 * Falls back to `fallback` if no src or fetch fails.
 */
const AuthImage = ({ src, alt = '', className = '', fallback = null }) => {
    const [blobUrl, setBlobUrl] = useState(null);

    useEffect(() => {
        if (!src) return;
        let objectUrl;

        const fetchImage = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(src, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Image fetch failed');
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            } catch (err) {
                console.error('[AuthImage] Failed to load:', src, err);
                setBlobUrl(null);
            }
        };

        fetchImage();

        // Revoke the object URL when the component unmounts or src changes
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (!blobUrl) return fallback;

    return <img src={blobUrl} alt={alt} className={className} />;
};

export default AuthImage;
