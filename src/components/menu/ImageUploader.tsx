"use client";
// src/components/menu/ImageUploader.tsx

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
    value: File | null;
    preview: string | null; // URL existante (édition)
    onChange: (file: File | null) => void;
    error?: string;
}

export function ImageUploader({ value, preview, onChange, error }: ImageUploaderProps) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const handleFile = useCallback((file: File | null) => {
        if (!file) {
            onChange(null);
            setLocalPreview(null);
            return;
        }
        // Validation
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            return;
        }
        onChange(file);
        const reader = new FileReader();
        reader.onloadend = () => setLocalPreview(reader.result as string);
        reader.readAsDataURL(file);
    }, [onChange]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0] ?? null;
        handleFile(file);
    }, [handleFile]);

    const displaySrc = localPreview ?? preview;

    return (
        <div>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{
                    border: `2px dashed ${dragging
                        ? "var(--amber-glow)"
                        : error
                            ? "rgba(239,68,68,0.5)"
                            : "var(--border-amber)"}`,
                    borderRadius: "1rem",
                    background: dragging
                        ? "rgba(245,158,11,0.05)"
                        : "var(--bg-section-alt)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {displaySrc ? (
                    <>
                        {/* Preview image */}
                        <img
                            src={displaySrc}
                            alt="Aperçu"
                            style={{
                                width: "100%", height: 220,
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                        {/* Overlay hover */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "rgba(0,0,0,0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.2s",
                        }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.45)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"}
                        >
                            <div style={{
                                color: "#fff", textAlign: "center", opacity: 0,
                                transition: "opacity 0.2s",
                                pointerEvents: "none",
                            }}
                                className="img-overlay-text"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 28, height: 28, marginBottom: 4 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600 }}>Changer l'image</p>
                            </div>
                        </div>

                        {/* Bouton supprimer */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                                setLocalPreview(null);
                                if (inputRef.current) inputRef.current.value = "";
                            }}
                            style={{
                                position: "absolute", top: "0.5rem", right: "0.5rem",
                                width: 28, height: 28, borderRadius: "50%",
                                background: "rgba(239,68,68,0.9)",
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", zIndex: 10,
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "2rem", pointerEvents: "none" }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: "var(--icon-bg)", border: "1px solid var(--icon-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 0.875rem",
                            color: "var(--icon-primary)",
                            transition: "all 0.2s",
                            ...(dragging && { background: "rgba(245,158,11,0.15)", transform: "scale(1.1)" }),
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 22, height: 22 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        </div>
                        <p style={{ margin: "0 0 0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {dragging ? "Déposez l'image ici" : "Glissez une image ou cliquez"}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            JPG, PNG · max 5 Mo
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />

            <style>{`
        div:hover .img-overlay-text { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}