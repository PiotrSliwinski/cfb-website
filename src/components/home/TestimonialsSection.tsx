import { getTestimonials } from '@/lib/supabase/queries/treatments';
import { Star } from 'lucide-react';

export async function TestimonialsSection({ locale }: { locale: string }) {
  const testimonials = await getTestimonials(locale);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#0098AA' }}>
          O que dizem os nossos pacientes
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial: any) => {
            const translation = testimonial.testimonial_translations[0];
            return (
              <div
                key={testimonial.id}
                className="bg-gray-50 p-8 rounded-lg"
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary-500 text-primary-500"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 italic">
                  "{translation.content}"
                </p>

                {/* Author */}
                <p className="font-semibold" style={{ color: '#4E5865' }}>
                  {translation.author_name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
