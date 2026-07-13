import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from "react-router-dom";
import './FeedbackWidget.css';
import api from '../../api';
const MAX_CHARS = 300;
const RATING_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Poor' },
  { value: 2, emoji: '😐', label: 'Fair' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
];

function RatingCards({ value, onChange, disabled }) {
  return (
    <div className="feedback-rating-grid" role="radiogroup" aria-label="Feedback rating">
      {RATING_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`feedback-rating-card ${selected ? 'selected' : ''}`}
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            aria-label={`${option.label} rating`}
            disabled={disabled}
          >
            <span className="feedback-rating-emoji" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="feedback-rating-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TextareaCard({
  id,
  name,
  label,
  initialValue,
  onDraftChange,
  placeholder,
  disabled,
}) {
  const [value, setValue] = useState(initialValue || '');
  const count = value.length;

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  return (
    <div className="feedback-input-card">
      <label className="feedback-input-title" htmlFor={id}>
        {label}
      </label>
      <div className="feedback-input-wrap">
        <textarea
          id={id}
          name={name}
          className="feedback-textarea"
          value={value}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setValue(nextValue);
            onDraftChange(nextValue);
          }}
          placeholder={placeholder}
          rows={4}
          maxLength={MAX_CHARS}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <span className="feedback-counter" aria-live="polite">
          {count}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return <span className="feedback-spinner" aria-hidden="true" />;
}

function FeedbackModal({
  isOpen,
  onClose,
  title,
  description,
  feedback,
  onFeedbackChange,
  likedDraft,
  improveDraft,
  onSubmit,
  statusMessage,
  submitState,
  rating,
  setRating,
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    lastFocusedElementRef.current = document.activeElement;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const timer = window.setTimeout(() => {
      const firstTextarea = modalRef.current?.querySelector('textarea:not([disabled])');
      (firstTextarea || closeButtonRef.current)?.focus?.();
    }, 0);

    const successTimer =
      submitState === 'success'
        ? window.setTimeout(() => {
            onClose();
          }, 2600)
        : null;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) {
        return;
      }

      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(focusableSelectors.join(','))
      ).filter((element) => !element.hasAttribute('disabled'));

      if (!focusableElements.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      if (successTimer) {
        window.clearTimeout(successTimer);
      }
      document.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      lastFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onClose, submitState]);

  if (!isOpen) {
    return null;
  }

    return createPortal(
    <div
      className="feedback-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="feedback-modal-shell"
        id="feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
        ref={modalRef}
        aria-busy={submitState === 'submitting'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="feedback-modal-close"
          onClick={onClose}
          aria-label="Close feedback modal"
          ref={closeButtonRef}
          disabled={submitState === 'submitting'}
        >
          ×
        </button>

        {submitState === 'success' ? (
          <div className="feedback-success-state" aria-live="polite">
            <div className="feedback-success-icon" aria-hidden="true">
              ✓
            </div>
            <h2 className="feedback-modal-title" id="feedback-modal-title">
              Thank You!
            </h2>
            <p className="feedback-modal-description" id="feedback-modal-description">
              Your feedback has been received.
            </p>
            <p className="feedback-success-copy">
              We truly appreciate your feedback. It helps us improve Lernevo for everyone.
            </p>

            {statusMessage ? <p className="feedback-status">{statusMessage}</p> : null}

            <div className="feedback-modal-actions feedback-modal-actions-success">
              <button type="button" className="feedback-done-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="feedback-modal-badge">Share your thoughts</div>
            <h2 className="feedback-modal-title" id="feedback-modal-title">
              {title}
            </h2>
            <p className="feedback-modal-description" id="feedback-modal-description">
              {description}
            </p>

            <div className="feedback-modal-body">
              <section className="feedback-section-card">
                <div className="feedback-section-header">
                  <div>
                    <p className="feedback-section-kicker">Quick rating</p>
                    <h3 className="feedback-section-title">How was your experience?</h3>
                  </div>
                </div>
                <RatingCards
                  value={rating}
                  onChange={setRating}
                  disabled={submitState === 'submitting'}
                />
              </section>

              <section className="feedback-section-card">
                <TextareaCard
                  id="feedback-liked"
                  name="liked"
                  label="What did you like?"
                  initialValue={likedDraft}
                  onDraftChange={(value) => onFeedbackChange('liked', value)}
                  placeholder="Share the parts that felt smooth, helpful, or delightful."
                  disabled={submitState === 'submitting'}
                  key="liked-card"
                />
              </section>

              <section className="feedback-section-card">
                <TextareaCard
                  id="feedback-improve"
                  name="improve"
                  label="What can we improve?"
                  initialValue={improveDraft}
                  onDraftChange={(value) => onFeedbackChange('improve', value)}
                  placeholder="Tell us what would make the experience even better."
                  disabled={submitState === 'submitting'}
                  key="improve-card"
                />
              </section>

              {statusMessage ? <p className="feedback-status" aria-live="polite">{statusMessage}</p> : null}
            </div>

            <div className="feedback-modal-actions feedback-modal-actions-stack">
              <button
                type="button"
                className="feedback-submit-btn"
                onClick={onSubmit}
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting' ? (
                  <>
                    <LoadingSpinner />
                    Submitting...
                  </>
                ) : (
                  'Submit feedback'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function FeedbackWidget() {
    const location = useLocation();

  
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [rating, setRating] = useState(5);
  const [draftSession, setDraftSession] = useState(0);
  const submitTimerRef = useRef(null);
  const draftRef = useRef({
    liked: '',
    improve: '',
  });
  
  const modalCopy = useMemo(
    () => ({
      title: 'Help Us Improve',
      description:
        'Your feedback helps us make Lernevo feel smoother, smarter, and more useful across every screen.',
    }),
    []
  );

  const handleFeedbackChange = (field, value) => {
    draftRef.current = {
      ...draftRef.current,
      [field]: value,
    };
  };

  const handleOpen = () => {
    setStatusMessage('');
    setSubmitState('idle');
    setRating(5);
    draftRef.current = {
      liked: '',
      improve: '',
    };
    setDraftSession((current) => current + 1);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
    setIsOpen(false);
    setStatusMessage('');
    setSubmitState('idle');
    setRating(5);
    draftRef.current = {
      liked: '',
      improve: '',
    };
  };

  const handleSubmit = async () => {

  const payload = {
    rating,
    liked: draftRef.current.liked,
    improve: draftRef.current.improve,
  
  };

  try {

    setSubmitState("submitting");
    setStatusMessage("Submitting your feedback...");

    await api.post("/feedback/", payload);

    setStatusMessage("Thanks again for your feedback.");
    setSubmitState("success");

  } catch (error) {

    console.error(error);

    setSubmitState("idle");
    setStatusMessage("Failed to submit feedback.");

  }

};

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);
 if (location.pathname.startsWith("/admin")) {
  return null;
}
  return (
    <>
      {!isOpen && submitState !== 'submitting' && submitState !== 'success' ? (
        <button
          type="button"
          className="feedback-launcher"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="feedback-modal"
        >
          <span className="feedback-launcher-glow" aria-hidden="true" />
          <span className="feedback-launcher-icon" aria-hidden="true">
            ✦
          </span>
          <span className="feedback-launcher-label">Feedback</span>
        </button>
      ) : null}

      <FeedbackModal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalCopy.title}
        description={modalCopy.description}
        onFeedbackChange={handleFeedbackChange}
        likedDraft={draftRef.current.liked}
        improveDraft={draftRef.current.improve}
        onSubmit={handleSubmit}
        statusMessage={statusMessage}
        submitState={submitState}
        rating={rating}
        setRating={setRating}
        key={`feedback-modal-${draftSession}`}
      />
    </>
  );
}
