interface VideoPlayerProps {
  videoUrl?: string;
}

export default function VideoPlayer({
  videoUrl,
}: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-border bg-card text-sm text-slate-500 shadow-xs">
        No video available for this lesson.
      </div>
    );
  }

  let embedUrl = videoUrl;

  // Convert normal YouTube links to embed links
  if (videoUrl.includes("youtube.com/watch?v=")) {
    const id = videoUrl.split("watch?v=")[1].split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  // Convert youtu.be links
  if (videoUrl.includes("youtu.be/")) {
    const id = videoUrl.split("youtu.be/")[1].split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-sm">
      <iframe
        src={embedUrl}
        title="Lesson Video"
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}