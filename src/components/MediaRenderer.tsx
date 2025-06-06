import { useContext, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';


type MediaRendererProps = {
  mediaId: string;
};

export const MediaRenderer = ({ mediaId }: MediaRendererProps) => {
  const { mediaItems } = useContext(AppContext);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = mediaItems.find(m => m.id === mediaId);

  if (!media) return <div>Media not found</div>;



  return (
    <div className="media-embed">
      {media.type.startsWith('image/') && (
        <img
          src={media.url}
          alt={media.name}
          className="embedded-media"
          draggable="false"
        />
      )}
      {media.type.startsWith('audio/') && (
        <audio 
          ref={audioRef}
          controls 
          className="embedded-media"
          src={media.url}
          onPlay={() => audioRef.current?.play()}
          onPause={() => audioRef.current?.pause()}
        />
      )}
      {media.type.startsWith('video/') && (
        <video 
          ref={videoRef}
          controls 
          className="embedded-media"
          src={media.url}
          onPlay={() => videoRef.current?.play()}
          onPause={() => videoRef.current?.pause()}
        />
      )}
    </div>
  );
};