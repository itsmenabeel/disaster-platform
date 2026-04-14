// components/MediaCard.jsx
import React, { useState } from "react";
import "../css/TrackRescue.css";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/**
 * Returns true when the stored value is a base64 data-URI or a file-path / URL
 * whose extension belongs to a common image format.
 */
const isImage = (url) => {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url);
};

/**
 * Returns true when the stored value is a base64 data-URI or a file-path / URL
 * whose extension belongs to a common video format.
 */
const isVideo = (url) => {
  if (!url) return false;
  if (url.startsWith("data:video/")) return true;
  return /\.(mp4|mov|avi|webm|mkv|ogg)(\?.*)?$/i.test(url);
};

/* ─── sub-components ──────────────────────────────────────────────────────── */

/** Clickable image thumbnail with a lightbox overlay. */
const ImageItem = ({ src, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div
        className="tr-media-thumb-wrap"
        onClick={() => setOpen(true)}
        title="Click to enlarge"
        style={{ cursor: "zoom-in" }}
      >
        <img
          src={src}
          alt={`attachment-${index + 1}`}
          className="tr-media-img"
          loading="lazy"
        />
        <div className="tr-media-thumb-overlay">🔍</div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="tr-lightbox-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="tr-lightbox-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={src}
            alt={`attachment-${index + 1} full size`}
            className="tr-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

/** Video player card — works with both data-URIs and regular URLs. */
const VideoItem = ({ src, index }) => (
  <div className="tr-media-video-wrap">
    <video
      src={src}
      controls
      preload="metadata"
      className="tr-media-video-player"
      aria-label={`video attachment ${index + 1}`}
    >
      Your browser does not support the video tag.
    </video>
    <div className="tr-media-video-label">🎥 Video {index + 1}</div>
  </div>
);

/** Fallback for unrecognised types — renders a download link. */
const UnknownItem = ({ src, index }) => (
  <a
    href={src}
    download={`attachment-${index + 1}`}
    target="_blank"
    rel="noopener noreferrer"
    className="tr-media-unknown"
  >
    📎 File {index + 1}
  </a>
);

/* ─── main component ──────────────────────────────────────────────────────── */

const MediaCard = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="tr-card">
      {/* Header */}
      <div className="tr-card__header">
        <div className="tr-card__title">Attached Media</div>
        <span className="tr-card__meta">
          {media.length} file{media.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div className="tr-media-grid">
        {media.map((url, i) => {
          if (isImage(url)) return <ImageItem key={i} src={url} index={i} />;
          if (isVideo(url)) return <VideoItem key={i} src={url} index={i} />;
          return <UnknownItem key={i} src={url} index={i} />;
        })}
      </div>
    </div>
  );
};

export default MediaCard;
