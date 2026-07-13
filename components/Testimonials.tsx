import React from 'react';
import { TESTIMONIALS } from '../constants';
import { Quote, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  // Hide the whole section when there are no genuine testimonials, rather than
  // render an empty grid. Real Google reviews are shown via the Elfsight widget.
  if (TESTIMONIALS.length === 0) {
    return null;
  }

  return (
    <div className="py-24 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-primary-600 font-semibold tracking-widest text-xs uppercase mb-3">
              {t('testimonials.label')}
            </h2>
            <h3 className="text-4xl font-serif font-bold text-slate-900">
              {t('testimonials.title')}
            </h3>
          </div>
          <div className="flex gap-2 text-primary-500">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} fill="currentColor" size={20} />
            ))}
            <span className="text-primary-700 text-sm ml-2 font-medium">
              5.0 {t('testimonials.rating')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(testimonial => (
            <div
              key={testimonial.id}
              className="bg-primary-50 p-8 rounded-2xl relative border border-primary-100 hover:border-primary-200 transition-colors"
            >
              <Quote className="text-primary-200 absolute top-8 right-8" size={48} />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-primary-500" fill="currentColor" />
                ))}
              </div>
              <p className="text-primary-800 italic mb-6 relative z-10 font-light text-lg">
                &ldquo;{t(`testimonials.items.${testimonial.id}.content`)}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-serif font-bold text-primary-800">
                  {t(`testimonials.items.${testimonial.id}.name`).charAt(0)}
                </div>
                <div>
                  <h5 className="font-semibold text-primary-900">
                    {t(`testimonials.items.${testimonial.id}.name`)}
                  </h5>
                  <p className="text-xs text-primary-700 uppercase tracking-wider">
                    {t(`testimonials.items.${testimonial.id}.role`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
