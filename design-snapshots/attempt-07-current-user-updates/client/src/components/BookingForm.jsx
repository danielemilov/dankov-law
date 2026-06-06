import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import './BookingForm.css';

const AREAS = [
  'Права на човека и дискриминация',
  'Омразна реч',
  'Трудово право',
  'Административно право',
  'Гражданско право',
  'Наказателно право',
  'НПО и обучения',
  'Друго',
];

export default function BookingForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      urgency: 'normal',
      contactMethod: 'phone',
      consent: false,
    },
  });

  const onSubmit = async (payload) => {
    try {
      await axios.post('/api/bookings', payload);
      setSent(true);
      reset();
      toast.success('Заявката е изпратена успешно.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Грешка при изпращане.';
      toast.error(msg);
    }
  };

  return (
    <section className="booking-card">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
  key="form"
  initial={{ opacity: 0, y: 22, scale: 0.982, filter: 'blur(8px)' }}
  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
  exit={{ opacity: 0, y: -12, scale: 0.985, filter: 'blur(6px)' }}
  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
>
           
<h3>Свържете се за правна консултация</h3>
<p className="booking-card__lead">
  Опишете накратко казуса си. Ще получите обратна връзка за подходящ час, нужните документи и следващите стъпки.
</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-grid form-grid--2">
                <Field label="Име *" error={errors.name?.message}>
                  <input {...register('name', { required: 'Въведете име', minLength: { value: 2, message: 'Минимум 2 символа' } })} placeholder="Иван Иванов" />
                </Field>
                <Field label="Телефон *" error={errors.phone?.message}>
                  <input {...register('phone', { required: 'Въведете телефон' })} placeholder="+359 88..." />
                </Field>
              </div>

              <Field label="Имейл *" error={errors.email?.message}>
                <input type="email" {...register('email', {
                  required: 'Въведете имейл',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Невалиден имейл' },
                })} placeholder="email@example.com" />
              </Field>

              <div className="form-grid form-grid--2">
                <Field label="Правна област *" error={errors.area?.message}>
                  <select {...register('area', { required: 'Изберете област' })} defaultValue="">
                    <option value="" disabled>Изберете...</option>
                    {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </Field>
                <Field label="Спешност">
                  <select {...register('urgency')}>
                    <option value="normal">Нормално</option>
                    <option value="soon">Скоро</option>
                    <option value="urgent">Спешно</option>
                  </select>
                </Field>
              </div>

              <div className="form-grid form-grid--3">
                <Field label="Дата">
                  <input type="date" {...register('preferredDate')} />
                </Field>
                <Field label="Час">
                  <input type="time" {...register('preferredTime')} />
                </Field>
                <Field label="Връзка">
                  <select {...register('contactMethod')}>
                    <option value="phone">Телефон</option>
                    <option value="email">Имейл</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </Field>
              </div>

              <Field label="Кратко описание">
                <textarea rows="4" {...register('message')} placeholder="Например: получих заповед, уволнение, дискриминация, проблем с институция..." />
              </Field>

              <label className="consent">
                <input type="checkbox" {...register('consent', { required: 'Необходимо е съгласие' })} />
                <span>Съгласявам се данните ми да бъдат обработени с цел обратна връзка по заявката.</span>
              </label>
              {errors.consent && <small className="field-error">{errors.consent.message}</small>}

<button className="booking-submit" type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Изпращане...' : 'Изпрати запитване →'}
</button>
            </form>
          </motion.div>
        ) : (
            <motion.div
  key="success"
  className="booking-success"
  initial={{ opacity: 0, y: 22, scale: 0.982, filter: 'blur(8px)' }}
  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
  exit={{ opacity: 0, y: -12, scale: 0.985, filter: 'blur(6px)' }}
  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
>
            <div className="booking-success__icon">✓</div>
            <h3>Данните са изпратени</h3>
            <p>Ще получите обратна връзка за потвърждение. При спешен срок подгответе всички документи по случая.</p>
            <button type="button" onClick={() => setSent(false)}>Изпрати друга заявка</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
