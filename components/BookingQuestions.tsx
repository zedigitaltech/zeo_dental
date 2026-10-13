import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * The three qualifying questions of the clinic's Meta lead form, asked on the website forms too.
 * Values match the API (worker/src/lib/bookingQuestions.ts); has_xray is sent as a boolean.
 */
export type TreatmentInterest = 'implants' | 'veneers' | 'unsure';
export type HasXray = 'yes' | 'no';
export type TravelTimeframe = 'within_30_days' | '1_to_3_months' | 'over_3_months';

export interface BookingAnswers {
  treatment_interest: TreatmentInterest | '';
  has_xray: HasXray | '';
  travel_timeframe: TravelTimeframe | '';
}

export const EMPTY_ANSWERS: BookingAnswers = {
  treatment_interest: '',
  has_xray: '',
  travel_timeframe: '',
};

type QuestionKey = keyof BookingAnswers;

const QUESTIONS: ReadonlyArray<{ key: QuestionKey; options: readonly string[] }> = [
  { key: 'treatment_interest', options: ['implants', 'veneers', 'unsure'] },
  { key: 'has_xray', options: ['yes', 'no'] },
  { key: 'travel_timeframe', options: ['within_30_days', '1_to_3_months', 'over_3_months'] },
];

/** The first unanswered question, or null when all three are answered. */
export function firstUnanswered(a: BookingAnswers): QuestionKey | null {
  return QUESTIONS.find(q => !a[q.key])?.key ?? null;
}

/** The fields added to the POST /api/booking body. */
export function answersPayload(a: BookingAnswers) {
  return {
    treatment_interest: a.treatment_interest || undefined,
    has_xray: a.has_xray ? a.has_xray === 'yes' : undefined,
    travel_timeframe: a.travel_timeframe || undefined,
  };
}

/** DOM id of a question's fieldset, so a form can focus the first unanswered one. */
export const questionId = (idPrefix: string, key: QuestionKey) => `${idPrefix}-${key}`;

interface BookingQuestionsProps {
  value: BookingAnswers;
  onChange: (next: BookingAnswers) => void;
  /** 'dark' for the black/white/gold booking page, 'light' for the white form. */
  variant: 'dark' | 'light';
  /** Unique per form on the page (radio names and ids). */
  idPrefix: string;
  /** Shown when the visitor tried to submit with a question unanswered. */
  showErrors?: boolean;
  /** Shown under the X-ray question when the answer is yes (e.g. a link to the upload area). */
  xrayYesHint?: React.ReactNode;
}

const STYLES = {
  dark: {
    legend: 'font-serif text-lg md:text-xl text-white mb-4',
    required: 'text-studio-gold ml-1',
    option:
      'inline-flex items-center justify-center min-h-[44px] px-5 py-3 border border-white/20 text-sm text-white/70 cursor-pointer transition-colors select-none hover:border-white/50 peer-checked:border-studio-gold peer-checked:bg-studio-gold/10 peer-checked:text-studio-gold peer-focus-visible:ring-2 peer-focus-visible:ring-studio-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-studio-black',
    error: 'mt-3 text-sm text-red-400',
  },
  light: {
    legend: 'text-sm font-medium text-primary-900 mb-3',
    required: 'text-red-500 ml-1',
    option:
      'inline-flex items-center justify-center min-h-[44px] px-5 py-3 border border-primary-100 rounded-xl bg-white text-sm text-primary-900 cursor-pointer transition-colors select-none hover:border-primary-400 peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:font-semibold peer-focus-visible:ring-4 peer-focus-visible:ring-primary-500/30',
    error: 'mt-2 text-sm text-red-600',
  },
} as const;

export const BookingQuestions: React.FC<BookingQuestionsProps> = ({
  value,
  onChange,
  variant,
  idPrefix,
  showErrors = false,
  xrayYesHint,
}) => {
  const { t } = useTranslation();
  const s = STYLES[variant];

  return (
    <div className="space-y-8">
      {QUESTIONS.map(q => {
        const id = questionId(idPrefix, q.key);
        const missing = showErrors && !value[q.key];
        const errorId = `${id}-error`;
        return (
          <fieldset
            key={q.key}
            id={id}
            tabIndex={-1}
            aria-required="true"
            aria-invalid={missing || undefined}
            aria-describedby={missing ? errorId : undefined}
            className="focus:outline-none"
          >
            <legend className={s.legend}>
              {t(`booking.questions.${q.key}.label`)}
              <span className={s.required} aria-hidden="true">
                *
              </span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {q.options.map(opt => {
                const optionId = `${id}-${opt}`;
                return (
                  <div key={opt}>
                    <input
                      type="radio"
                      id={optionId}
                      name={`${idPrefix}-${q.key}`}
                      value={opt}
                      checked={value[q.key] === opt}
                      onChange={() => onChange({ ...value, [q.key]: opt })}
                      className="peer sr-only"
                    />
                    <label htmlFor={optionId} className={s.option}>
                      {t(`booking.questions.${q.key}.${opt}`)}
                    </label>
                  </div>
                );
              })}
            </div>
            {q.key === 'has_xray' && value.has_xray === 'yes' && xrayYesHint}
            {missing && (
              <p id={errorId} role="alert" className={s.error}>
                {t('booking.questions.required')}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
};
