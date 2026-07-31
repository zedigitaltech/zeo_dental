import React, { useState, useCallback, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Video {
  id: string;
  youtubeId: string;
  thumbnailKey: string;
}

// Add YouTube video IDs here when ready
const VIDEOS: Video[] = [
  // { id: '1', youtubeId: 'dQw4w9WgXcQ', thumbnailKey: 'videoTestimonials.thumb1' },
  // { id: '2', youtubeId: 'dQw4w9WgXcQ', thumbnailKey: 'videoTestimonials.thumb2' },
  // { id: '3', youtubeId: 'dQw4w9WgXcQ', thumbnailKey: 'videoTestimonials.thumb3' },
];

export const VideoTestimonials: React.FC = () => {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const openVideo = useCallback((youtubeId: string) => {
    setActiveVideo(youtubeId);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVideo();
    };
    if (activeVideo) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeVideo, closeVideo]);

  // Don't render if no videos configured yet
  if (VIDEOS.length === 0) return null;

  return (
    <>
      <section className="py-16 sm:py-20 md:py-28 bg-neutral-50" id="testimonials">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <span className="block text-studio-gold text-[10px] uppercase tracking-ultra mb-4">
              {t('videoTestimonials.label')}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-studio-black mb-4">
              {t('videoTestimonials.title')}
            </h2>
            <p className="text-studio-gray font-light max-w-xl mx-auto">
              {t('videoTestimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {VIDEOS.map(video => (
              <button
                key={video.id}
                onClick={() => openVideo(video.youtubeId)}
                className="group relative aspect-video bg-studio-black overflow-hidden cursor-pointer"
                data-cursor="hover"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-white text-xs uppercase tracking-ultra">
                    {t('videoTestimonials.watchVideo')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          <button
            onClick={closeVideo}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            aria-label="Close video"
          >
            <X size={28} strokeWidth={1} />
          </button>
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="Patient testimonial"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};
