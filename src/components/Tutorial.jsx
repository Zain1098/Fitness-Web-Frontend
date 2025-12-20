import React, { useState, useEffect } from 'react';
import './Tutorial.css';

const tutorialSteps = {
  dashboard: [
    {
      target: '[data-tutorial="focus-section"]',
      title: 'Today\'s Focus',
      description: 'Track your daily calories, workouts, weight, and water intake all in one place. Click any card to view detailed information.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="quick-actions"]',
      title: 'Quick Actions',
      description: 'Start a workout, log meals, track progress, or browse exercises with just one click. These are your main action buttons.',
      position: 'bottom'
    },
    {
      target: '.notification-btn',
      title: 'Notifications',
      description: 'Stay updated with workout reminders, achievement alerts, and fitness milestones. Click to view all your notifications.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="chatbot-btn"]',
      title: 'AI Fitness Coach',
      description: 'Get personalized workout plans, nutrition advice, and motivation from your AI coach. Available 24/7 to help you reach your goals.',
      position: 'left'
    },
    {
      target: '[data-tutorial="streak-section"]',
      title: 'Streak & Goals',
      description: 'Track your workout streak and monitor progress towards your weight goal. Stay motivated by building consistent habits.',
      position: 'left'
    },
    {
      target: '[data-tutorial="upgrade-btn"]',
      title: 'Upgrade to Premium',
      description: 'Unlock advanced features like personalized meal plans, detailed analytics, and priority AI coach support.',
      position: 'bottom'
    }
  ],
  dailyTracker: [
    {
      target: '[data-tutorial="view-analytics"]',
      title: 'View Full Analytics',
      description: 'Click here to see detailed insights, trends, and comprehensive analysis of your daily habits and fitness records.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="water-intake"]',
      title: 'Water Intake Tracker',
      description: 'Click the glasses to track your daily water consumption. Goal is 8 glasses per day to stay hydrated.',
      position: 'bottom'
    },
    {
      target: '.tracker-card:nth-child(2)',
      title: 'Steps Counter',
      description: 'Log your daily steps here. Aim for 10,000 steps per day for optimal health and fitness.',
      position: 'bottom'
    },
    {
      target: '.tracker-card:nth-child(3)',
      title: 'Sleep Hours',
      description: 'Track your sleep duration. Optimal sleep is 7-9 hours per night for recovery and performance.',
      position: 'bottom'
    },
    {
      target: '.tracker-card:nth-child(4)',
      title: 'Daily Mood',
      description: 'Record how you feel each day. Tracking mood helps identify patterns and maintain mental wellness.',
      position: 'bottom'
    },
    {
      target: '.save-btn',
      title: 'Save Your Progress',
      description: 'Click here to save all your daily tracking data. Your progress will be stored and reflected in analytics.',
      position: 'top'
    }
  ],
  exercises: [
    {
      target: '.exercise-tabs',
      title: 'Exercise Hub Navigation',
      description: 'Access exercise library, favorites, workout builder, smart planner, saved workouts, and your complete workout history all in one place.',
      position: 'bottom'
    },
    {
      target: '.filters-section',
      title: 'Filter & Search',
      description: 'Filter exercises by muscle group, equipment type, and difficulty level. Use search to find specific exercises quickly.',
      position: 'bottom'
    },
    {
      target: '.exercises-grid .exercise-card:first-child',
      title: 'Exercise Cards',
      description: 'Each card shows exercise details, target muscles, and equipment needed. Click View for full instructions, Star to favorite, or Add to build workouts.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(3)',
      title: 'Workout Builder',
      description: 'Create custom workout routines by selecting exercises, setting reps and sets, and saving them for future use.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(4)',
      title: 'Smart Planner',
      description: 'Generate AI-powered weekly workout plans based on your goals, experience level, available equipment, and schedule.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(6)',
      title: 'History & Analytics',
      description: 'Track your workout history, view detailed statistics, monitor streaks, and analyze your fitness progress over time.',
      position: 'bottom'
    }
  ],
  nutrition: [
    {
      target: '.nutrition-tabs',
      title: 'Nutrition Hub Navigation',
      description: 'Access nutrition tracker, set goals, plan meals, browse food database, build recipes, and view detailed analytics all in one place.',
      position: 'bottom'
    },
    {
      target: '.daily-stats',
      title: 'Daily Nutrition Overview',
      description: 'Monitor your daily calorie intake, protein, carbs, and fats with real-time progress bars showing percentage of your daily goals.',
      position: 'bottom'
    },
    {
      target: '.add-meal-section',
      title: 'Add Meals',
      description: 'Log your meals with auto-fill nutrition data, browse food database, or use quick meal shortcuts. Supports local Pakistani foods.',
      position: 'bottom'
    },
    {
      target: '.quick-actions',
      title: 'Quick Actions',
      description: 'Browse curated food database, plan weekly meals, build custom recipes, and view detailed nutrition analytics.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(2)',
      title: 'Goals & Targets',
      description: 'Set personalized nutrition goals based on your fitness objectives, activity level, and body composition targets.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(3)',
      title: 'Meal Planner',
      description: 'Plan your weekly meals in advance with smart suggestions and nutritional balance to stay on track with your goals.',
      position: 'bottom'
    }
  ],
  progress: [
    {
      target: '.progress-tabs',
      title: 'Progress Tracking Tabs',
      description: 'Record new progress entries, view your timeline, analyze charts, upload progress photos, and track body measurements all in one place.',
      position: 'bottom'
    },
    {
      target: '.quick-stats-grid',
      title: 'Quick Stats Overview',
      description: 'View your current weight, target weight, and total progress records at a glance. Track your journey towards your fitness goals.',
      position: 'bottom'
    },
    {
      target: '.record-form',
      title: 'Record Progress',
      description: 'Log your weight, body fat percentage, muscle mass, and body measurements. Use built-in calculators for accurate body composition tracking.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(2)',
      title: 'Progress Timeline',
      description: 'View your complete progress history in chronological order. Edit or delete entries, and track your transformation over time.',
      position: 'bottom'
    },
    {
      target: '.tab-btn:nth-child(3)',
      title: 'Charts & Analytics',
      description: 'Visualize your progress with interactive charts showing weight trends, body fat changes, and muscle mass growth over time.',
      position: 'bottom'
    },
    {
      target: '.unit-toggle-btn:first-child',
      title: 'Unit Conversion',
      description: 'Switch between metric (kg/cm) and imperial (lbs/inches) units for weight and measurements based on your preference.',
      position: 'bottom'
    }
  ],
  settings: [
    {
      target: '[data-tutorial="profile-settings"]',
      title: 'Profile Settings',
      description: 'Update your personal information and customize your profile preferences.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="notification-settings"]',
      title: 'Notifications',
      description: 'Manage your notification preferences to stay updated on your fitness activities.',
      position: 'bottom'
    }
  ]
};

const Tutorial = ({ page, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);

  const steps = tutorialSteps[page] || [];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial_${page}_completed`);
    if (!hasSeenTutorial && steps.length > 0) {
      setTimeout(() => setIsVisible(true), 500);
    }
    if (hasSeenTutorial && steps.length > 0) {
      setShowButton(true);
    }
  }, [page, steps.length]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const position = steps[currentStep].position || 'bottom';
          
          let top, left;
          
          // Check if element is near bottom or would cause tooltip to go off-screen
          const tooltipHeight = 250; // Approximate tooltip height
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          if (position === 'left' || position === 'right') {
            // For left/right positions, center vertically in viewport
            top = window.innerHeight / 2;
            if (position === 'left') {
              left = rect.left - 350;
            } else {
              left = rect.right + 20;
            }
          } else if (position === 'bottom' && spaceBelow < tooltipHeight) {
            // If not enough space below, show above
            top = rect.top - tooltipHeight - 20;
            left = rect.left + rect.width / 2;
          } else if (position === 'top' || (position === 'bottom' && spaceBelow < tooltipHeight)) {
            top = rect.top - 20;
            left = rect.left + rect.width / 2;
          } else {
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
          }
          
          // Ensure tooltip stays within viewport
          if (left < 180) left = 180;
          if (left > window.innerWidth - 180) left = window.innerWidth - 180;
          if (top < 20) top = 20;
          if (top > window.innerHeight - tooltipHeight - 20) top = window.innerHeight - tooltipHeight - 20;
          
          setTooltipPosition({ top, left });
        }, 100);
      }
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
