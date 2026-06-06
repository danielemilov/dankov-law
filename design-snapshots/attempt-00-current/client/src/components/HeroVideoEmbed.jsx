export default function HeroVideoEmbed({
  videoId,
  title,
  start = 0,
  className = '',
}) {
  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1` +
    `&mute=1` +
    `&controls=0` +
    `&loop=1` +
    `&playlist=${videoId}` +
    `&rel=0` +
    `&modestbranding=1` +
    `&playsinline=1` +
    `&iv_load_policy=3` +
    `&fs=0` +
    `&start=${start}`;

  return (
    <div className={`heroVideoEmbed ${className}`}>
      <iframe
        title={title}
        src={src}
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}