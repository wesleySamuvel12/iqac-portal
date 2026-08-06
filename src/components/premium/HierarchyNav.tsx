'use client';

import React from 'react';
import { 
  ChevronRight, 
  Check, 
  Circle, 
  ArrowLeft,
  Building2,
  GraduationCap,
  Users,
  User,
  type LucideIcon 
} from 'lucide-react';

export interface HierarchyStep {
  /** Unique identifier */
  id: string;
  /** Step label */
  label: string;
  /** Optional subtitle or count */
  subtitle?: string;
  /** Icon for the step */
  icon?: LucideIcon;
  /** Is this step completed? */
  completed?: boolean;
  /** Is this step clickable? */
  clickable?: boolean;
  /** Additional data for the step */
  data?: Record<string, unknown>;
}

export interface HierarchyNavProps {
  /** Array of hierarchy steps */
  steps: HierarchyStep[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when a step is clicked */
  onStepClick?: (step: HierarchyStep, index: number) => void;
  /** Enable back navigation */
  allowBack?: boolean;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Layout variant */
  variant?: 'horizontal' | 'vertical' | 'compact';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show step numbers */
  showNumbers?: boolean;
}

const defaultIcons: LucideIcon[] = [Building2, GraduationCap, Users, User];

const HierarchyNav: React.FC<HierarchyNavProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowBack = true,
  onBack,
  variant = 'horizontal',
  size = 'md',
  className = '',
  showNumbers = false,
}) => {
  const getStepState = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (steps[index]?.completed || index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'upcoming';
  };

  const handleStepClick = (step: HierarchyStep, index: number) => {
    if (step.clickable !== false && onStepClick) {
      onStepClick(step, index);
    }
  };

  const sizeClasses = {
    sm: { container: 'gap-1', step: 'px-2 py-1', icon: 'w-4 h-4', text: 'text-xs', connector: 'w-3 h-3' },
    md: { container: 'gap-2', step: 'px-3 py-2', icon: 'w-5 h-5', text: 'text-sm', connector: 'w-5 h-5' },
    lg: { container: 'gap-3', step: 'px-4 py-3', icon: 'w-6 h-6', text: 'text-base', connector: 'w-6 h-6' },
  };

  const sizes = sizeClasses[size];

  // Horizontal Layout
  if (variant === 'horizontal') {
    return (
      <div className={`w-full ${className}`}>
        {/* Back button */}
        {allowBack && currentStep > 0 && (
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        )}

        <div className={`flex items-center ${sizes.container}`}>
          {steps.map((step, index) => {
            const state = getStepState(index);
            const Icon = step.icon || defaultIcons[index] || Circle;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* Step */}
                <button
                  onClick={() => handleStepClick(step, index)}
                  disabled={state === 'upcoming'}
                  className={`
                    group relative flex items-center ${sizes.step} rounded-xl
                    transition-all duration-300 ease-out
                    ${state === 'active' 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-md shadow-emerald-100' 
                      : state === 'completed'
                      ? 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-50/50 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Connector line before (except first) */}
                  {index > 0 && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-slate-200" />
                  )}

                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 rounded-full flex items-center justify-center
                    ${sizes.icon}
                    ${state === 'active'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                      : state === 'completed'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200 text-slate-400'
                    }
                  `}>
                    {state === 'completed' ? (
                      <Check className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    ) : showNumbers ? (
                      <span className={`font-semibold ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
                        {index + 1}
                      </span>
                    ) : (
                      <Icon className={size === 'sm' ? 'w-3 h-3' : sizes.icon} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="ml-2 min-w-0">
                    <p className={`
                      font-medium truncate
                      ${state === 'active' ? 'text-emerald-800' : state === 'completed' ? 'text-slate-700' : 'text-slate-400'}
                      ${sizes.text}
                    `}>
                      {step.label}
                    </p>
                    {step.subtitle && (
                      <p className={`text-slate-400 truncate ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
                        {step.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Active indicator pulse */}
                  {state === 'active' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 animate-pulse pointer-events-none" />
                  )}
                </button>

                {/* Connector */}
                {!isLast && (
                  <ChevronRight className={`flex-shrink-0 text-slate-300 ${sizes.connector}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Layout
  if (variant === 'vertical') {
    return (
      <div className={`w-full max-w-xs ${className}`}>
        {allowBack && currentStep > 0 && (
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        )}

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200" />

          {steps.map((step, index) => {
            const state = getStepState(index);
            const Icon = step.icon || defaultIcons[index] || Circle;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step, index)}
                disabled={state === 'upcoming'}
                className={`
                  relative flex items-center w-full py-3 rounded-lg
                  transition-all duration-200
                  ${state === 'active' 
                    ? 'bg-emerald-50' 
                    : state === 'completed'
                    ? 'hover:bg-slate-50'
                    : 'opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Icon node on line */}
                <div className={`
                  absolute left-[-22px] w-7 h-7 rounded-full flex items-center justify-center
                  border-2 border-white shadow-sm
                  ${state === 'active'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                    : state === 'completed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-slate-200 text-slate-400'
                  }
                `}>
                  {state === 'completed' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content */}
                <div className="text-left w-full">
                  <p className={`
                    font-medium
                    ${state === 'active' ? 'text-emerald-800' : state === 'completed' ? 'text-slate-700' : 'text-slate-400'}
                    ${sizes.text}
                  `}>
                    {step.label}
                  </p>
                  {step.subtitle && (
                    <p className="text-xs text-slate-400">{step.subtitle}</p>
                  )}
                </div>

                {/* Active bar */}
                {state === 'active' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-l-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact Layout (for mobile)
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, index) => {
          const state = getStepState(index);
          
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={state === 'upcoming'}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                  transition-all duration-200
                  ${state === 'active'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : state === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {step.label}
              </button>
              
              {index < steps.length - 1 && (
                <ChevronRight className="flex-shrink-0 w-4 h-4 text-slate-300 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Academic-specific preset
export interface AcademicHierarchyProps {
  department?: string;
  year?: string;
  section?: string;
  studentName?: string;
  currentLevel: 'department' | 'year' | 'section' | 'student';
  onNavigate?: (level: AcademicHierarchyProps['currentLevel']) => void;
  className?: string;
}

export const AcademicHierarchy: React.FC<AcademicHierarchyProps> = ({
  department = 'Select Department',
  year = 'Select Year',
  section = 'Select Section',
  studentName = 'Student',
  currentLevel,
  onNavigate,
  className = '',
}) => {
  const levels = [
    { id: 'department', label: department, icon: Building2 },
    { id: 'year', label: year, icon: GraduationCap },
    { id: 'section', label: section, icon: Users },
    { id: 'student', label: studentName, icon: User },
  ] as const;

  const currentIndex = levels.findIndex(l => l.id === currentLevel);

  const steps: HierarchyStep[] = levels.map((level, index) => ({
    id: level.id,
    label: level.label,
    icon: level.icon,
    completed: index < currentIndex,
    clickable: index <= currentIndex,
  }));

  return (
    <HierarchyNav
      steps={steps}
      currentStep={currentIndex}
      variant="horizontal"
      size="md"
      allowBack={false}
      onStepClick={(step) => onNavigate?.(step.id as AcademicHierarchyProps['currentLevel'])}
      className={className}
    />
  );
};

export default HierarchyNav;
