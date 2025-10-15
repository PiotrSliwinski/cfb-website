'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

export function ContactForm() {
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      treatment_interest: formData.get('treatment'),
      language_code: locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSuccess && (
        <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded">
          Mensagem enviada com sucesso! Entraremos em contacto em breve.
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
          Tratamento de interesse
        </label>
        <select
          id="treatment"
          name="treatment"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Selecione um tratamento</option>
          <option value="implantes-dentarios">Implantes Dentários</option>
          <option value="aparelho-invisivel">Aparelho Invisível</option>
          <option value="branqueamento">Branqueamento</option>
          <option value="ortodontia">Ortodontia</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Mensagem *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
      </button>
    </form>
  );
}
