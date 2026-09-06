import React, { useState, useEffect } from 'react';
import './Tutorial.css';

const tutorialSteps = {
  dashboard: [
    {
      target: 'header h1',
      title: 'Welcome to FitForge! 👋',
      description: 'This is your centralized command center. Monitor daily readiness, active routines, and bio-metrics at a glance.',
      position: 'bottom'
    },
    {
      target: 'button:has(svg.lucide-crown)',
      title: 'FitForge Pro & Upgrade',
      description: 'Access custom macronutrient plans, advanced analytics, and prioritized 24/7 AI coach guidance.',
      position: 'bottom'
    },
    {
      target: 'button:has(svg.lucide-arrow-right)',
      title: 'Start Today\'s Routine',
      description: 'Jump straight into your personalized workout session calibrated for your fitness level and available gym/home equipment.',
      position: 'top'
    },
    {
      target: 'div:has(> div > h3:contains("Hydration"))',
      title: 'Interactive Hydration Tracker',
      description: 'Tap on any water cup to log +250ml instantly. Stay consistently hydrated to optimize muscle recovery.',
      position: 'bottom'
    },
    {
      target: 'div.grid.grid-cols-1.md\\:grid-cols-3',
      title: 'Daily Habits & Vitals',
      description: 'Review your deep sleep quality, calorie targets, and body weight progression curve.',
      position: 'top'
    }
  ],
  dailyTracker: [
    {
      target: 'header h1',
      title: 'Daily Activity & Habits',
      description: 'Record your daily health inputs: hydration, sleep hours, step volume, and subjective mood readiness.',
      position: 'bottom'
    },
    {
      target: 'input[type="date"]',
      title: 'Historical Date Browser',
      description: 'Jump to any past date to inspect your historical tracking logs or add missed data.',
      position: 'bottom'
    },
    {
      target: 'button:has(svg.lucide-smartphone)',
      title: 'Google Fit Auto-Sync',
      description: 'Connect Google Fit to automatically synchronize your real-time steps, sleep duration, and active calories.',
      position: 'bottom'
    },
    {
      target: 'div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4',
      title: 'Interactive Habit Cards',
      description: 'Quickly adjust water glasses, enter steps, log sleep, and pick your mood for the day.',
      position: 'bottom'
    },
    {
      target: 'button:has(svg.lucide-save)',
      title: 'Save Daily Record',
      description: 'Click here to save your daily logs. Your consistency streak and analytics will automatically update.',
      position: 'top'
    }
  ],
  exercises: [
    {
      target: '.exercise-tabs',
      title: 'Exercise Hub Navigation',
      description: 'Access the complete movement library, saved routines, workout builder, smart AI weekly planner, and workout logs.',
      position: 'bottom'
    },
    {
      target: '.filters-container, .exercise-filters',
      title: 'Filter & Search Engine',
      description: 'Filter over 60+ exercises by muscle group (chest, back, legs), equipment (barbell, dumbbells, cables), and difficulty.',
      position: 'bottom'
    },
    {
      target: '.exercises-grid',
      title: 'Movement Cards & Form Guides',
      description: 'Click any exercise card to inspect detailed technique breakdowns, targeted muscle anatomy, and video instructions.',
      position: 'top'
    }
  ],
  nutrition: [
    {
      target: 'div.flex.items-center.gap-2.overflow-x-auto',
      title: 'Nutrition Hub Tabs',
      description: 'Switch between your Daily Tracker, Personalized Goals, Weekly Meal Planner, Food Database, and Recipe Builder.',
      position: 'bottom'
    },
    {
      target: 'div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4',
      title: 'Daily Calorie & Macro Target',
      description: 'Real-time calculation of your remaining calories, protein, carbohydrates, and fats based on your body composition goal.',
      position: 'bottom'
    },
    {
      target: 'button:has(svg.lucide-plus)',
      title: 'Log Meals & Quick Calories',
      description: 'Search foods from our database or use Quick Add to log snack calories in seconds.',
      position: 'bottom'
    }
  ],
  progress: [
    {
      target: '.progress-tabs',
      title: 'Progress Navigation',
      description: 'Switch between recording body measurements, viewing your visual timeline, inspecting body composition charts, and progress photos.',
      position: 'bottom'
    },
    {
      target: '.progress-form-container, .record-section',
      title: 'Body Metrics & Weight Log',
      description: 'Enter your weight, body fat %, muscle mass, and tape measurements to track body recomposition over time.',
      position: 'bottom'
    },
    {
      target: 'button[id="photo-upload-record"], button:contains("Choose Photos")',
      title: 'Visual Photo Progress',
      description: 'Upload before & after progress photos. All images are automatically compressed for high-speed cloud sync.',
      position: 'top'
    }
  ],
  settings: [
    {
      target: '.settings-sidebar',
      title: 'Settings Navigation',
      description: 'Easily jump between your Profile, Fitness Goals, Body Measurements, WhatsApp Reminders, and Security.',
      position: 'right'
    },
    {
      target: '.btn-save-pro',
      title: 'Save Profile Preferences',
      description: 'Whenever you change your metrics or reminder times, click Save Changes to persist your updates.',
      position: 'top'
    }
  ]
};

const Tutorial = ({ page = 'dashboard', onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 100, left: window.innerWidth / 2 });
  const [showButton, setShowButton] = useState(false);

  const steps = tutorialSteps[page] || tutorialSteps.dashboard || [];

  useEffect(() => {
    if (!page || steps.length === 0) return;
    const hasSeenTutorial = localStorage.getItem(`tutorial_${page}_completed`);
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsVisible(true), 700);
      return () => clearTimeout(timer);
    } else {
      setShowButton(true);
    }
  }, [page, steps.length]);

  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;

    let el = null;
    try {
      el = document.querySelector(steps[currentStep].target);
    } catch (_) {
      el = null;
    }

    const tooltipHeight = 240;
    const tooltipWidth = Math.min(380, window.innerWidth - 32);

    if (el) {
      setTargetElement(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const timer = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const position = steps[currentStep].position || 'bottom';
        const spaceBelow = window.innerHeight - rect.bottom;

        let top;
        let left = window.innerWidth / 2;

        if (position === 'top' || (position === 'bottom' && spaceBelow < tooltipHeight + 30)) {
          top = Math.max(30, rect.top - tooltipHeight - 20);
        } else if (position === 'right' || position === 'left') {
          top = Math.max(30, Math.min(window.innerHeight - tooltipHeight - 30, rect.top + rect.height / 2 - tooltipHeight / 2));
        } else {
          top = Math.min(window.innerHeight - tooltipHeight - 30, rect.bottom + 20);
        }

        top = Math.max(30, Math.min(top, window.innerHeight - tooltipHeight - 30));
        setTooltipPosition({ top, left });
      }, 150);

      return () => clearTimeout(timer);
    } else {
      // Element not found - safely center modal in viewport without breaking overlay
      setTargetElement(null);
      setTooltipPosition({
        top: Math.max(40, (window.innerHeight - tooltipHeight) / 2),
        left: window.innerWidth / 2
      });
    }
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    localStorage.setItem(`tutorial_${page}_completed`, 'true');
    setIsVisible(false);
    setShowButton(true);
    if (onComplete) onComplete();
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  if (!isVisible && steps.length === 0) return null;

  return (
    <>
      {showButton && !isVisible && (
        <button 
          className="tutorial-restart-btn" 
          onClick={restartTutorial}
          title="Restart Tutorial"
        >
          ❓
        </button>
      )}
      
      {isVisible && (
      <>
      <div className="tutorial-overlay" onClick={handleNext} />
      
      {targetElement && (
        <div 
          className="tutorial-spotlight"
          style={{
            top: targetElement.getBoundingClientRect().top - 10,
            left: targetElement.getBoundingClientRect().left - 10,
            width: targetElement.offsetWidth + 20,
            height: targetElement.offsetHeight + 20,
          }}
        />
      )}

      <div 
        className="tutorial-tooltip"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="tutorial-header">
          <h3>{steps[currentStep].title}</h3>
          <button className="tutorial-close" onClick={handleSkip}>✕</button>
        </div>
        
        <p className="tutorial-description">{steps[currentStep].description}</p>
        
        <div className="tutorial-footer">
          <div className="tutorial-progress">
            {currentStep + 1} / {steps.length}
          </div>
          
          <div className="tutorial-actions">
            <button className="tutorial-skip-btn" onClick={handleSkip}>
              Skip Tutorial
            </button>
            <button className="tutorial-next-btn" onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </>
  );
};

export default Tutorial;
