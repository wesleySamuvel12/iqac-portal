'use client';

import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  MoreVertical,
  Edit,
  MessageSquare,
  FileText,
  Download,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';

export interface StudentProfile {
  /** Unique identifier */
  id: string;
  /** Full name */
  name: string;
  /** Registration number */
  registerNumber: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Department name */
  department: string;
  /** Academic year (e.g., "III Year") */
  year: string;
  /** Section (e.g., "A") */
  section?: string;
  /** Current CGPA */
  cgpa: number;
  /** Maximum possible CGPA */
  maxCgpa?: number;
  /** Achievement score or points */
  achievementScore?: number;
  /** Profile photo URL */
  photoUrl?: string;
  /** Join date */
  joinDate?: string;
  /** Location/City */
  location?: string;
  /** Status */
  status?: 'active' | 'inactive' | 'graduated' | 'suspended';
}

export interface ProfileCardProps {
  /** Student profile data */
  student: StudentProfile;
  /** Variant style */
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  /** Show action buttons */
  showActions?: boolean;
  /** Custom actions */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Show CGPA ring */
  showCgpaRing?: boolean;
  /** Status indicator */
  showStatus?: boolean;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600', icon: Clock },
  graduated: { label: 'Graduated', color: 'bg-indigo-100 text-indigo-700', icon: Award },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

// CGPA Color coding
const getCgpaColor = (cgpa: number, maxCgpa = 10): { bg: string; text: string; ring: 'emerald' | 'indigo' | 'amber' | 'red' } => {
  const ratio = cgpa / maxCgpa;
  
  if (ratio >= 0.85) return { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'emerald' };
  if (ratio >= 0.7) return { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'indigo' };
  if (ratio >= 0.5) return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'amber' };
  return { bg: 'bg-red-50', text: 'text-red-600', ring: 'red' };
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  student,
  variant = 'default',
  showActions = true,
  actions,
  className = '',
  onClick,
  showCgpaRing = true,
  showStatus = true,
}) => {
  const {
    name,
    registerNumber,
    email,
    phone,
    department,
    year,
    section,
    cgpa,
    maxCgpa = 10,
    achievementScore,
    photoUrl,
    joinDate,
    location,
    status = 'active',
  } = student;

  const cgpaColors = getCgpaColor(cgpa, maxCgpa);
  const cgpaPercentage = (cgpa / maxCgpa) * 100;
  const currentStatus = statusConfig[status];

  // Default Actions
  const defaultActions = (
    <>
      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Send Message">
        <MessageSquare className="w-4 h-4 text-slate-500" />
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="View Details">
        <FileText className="w-4 h-4 text-slate-500" />
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Download Report">
        <Download className="w-4 h-4 text-slate-500" />
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="More Options">
        <MoreVertical className="w-4 h-4 text-slate-500" />
      </button>
    </>
  );

  // Minimal Variant - Just avatar and basic info
  if (variant === 'minimal') {
    return (
      <GlassCard 
        hover 
        className={`flex items-center gap-3 p-3 ${className}`}
        onClick={onClick}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
          <p className="text-xs text-slate-500 truncate">{registerNumber}</p>
        </div>

        {/* Status */}
        {showStatus && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        )}
      </GlassCard>
    );
  }

  // Compact Variant - Horizontal layout with key info
  if (variant === 'compact') {
    return (
      <GlassCard 
        hover 
        className={`p-4 ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <span className="text-white font-bold text-lg">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
            
            {/* Status Indicator */}
            {showStatus && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
                <p className="text-xs text-slate-500">{registerNumber}</p>
              </div>

              {/* CGPA Badge */}
              <div className={`px-2 py-1 rounded-lg ${cgpaColors.bg}`}>
                <span className={`text-sm font-bold ${cgpaColors.text}`}>{cgpa.toFixed(2)}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-full">
                {department}
              </span>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-medium rounded-full">
                {year}{section ? ` - Sec ${section}` : ''}
              </span>
              
              {achievementScore !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full">
                  <Award className="w-2.5 h-2.5" />
                  {achievementScore} pts
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {actions || defaultActions}
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  // Default/Detailed Variant - Full card with all info
  return (
    <GlassCard 
      hover 
      gradient
      className={`overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Header with gradient background */}
      <div className="relative h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
        <div className="absolute inset-0 bg-black/5" />
        
        {/* Action buttons in header */}
        {showActions && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {actions || (
              <>
                <button 
                  className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button 
                  className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title="More"
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Status badge */}
        {showStatus && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white`}>
              {React.createElement(currentStatus.icon, { className: 'w-3 h-3' })}
              {currentStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 -mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Name and Basic Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500">{registerNumber}</p>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                {department}
              </span>
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg">
                {year}{section ? ` - Section ${section}` : ''}
              </span>
            </div>
          </div>

          {/* CGPA Ring */}
          {showCgpaRing && (
            <div className="flex-shrink-0">
              <ProgressRing
                progress={cgpaPercentage}
                size={72}
                strokeWidth={6}
                color={cgpaColors.ring}
                showPercentage={false}
                label="CGPA"
              >
                <span className={`text-lg font-bold ${cgpaColors.text}`}>{cgpa.toFixed(2)}</span>
              </ProgressRing>
            </div>
          )}
        </div>

        {/* Stats Row */}
        {(achievementScore !== undefined) && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Achievement</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{achievementScore}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Rank</span>
              </div>
              <p className="text-lg font-bold text-slate-900">#42</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Attendance</span>
              </div>
              <p className="text-lg font-bold text-slate-900">94%</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Since</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{joinDate || '2021'}</p>
            </div>
          </div>
        )}

        {/* Contact Info (Detailed variant only) */}
        {variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${email}`} className="hover:text-emerald-600 transition-colors">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

// Horizontal list item for tables/lists
// ProfileListItem uses the same props as ProfileCard minus variant
export type ProfileListItemProps = Omit<ProfileCardProps, 'variant'>;

export const ProfileListItem: React.FC<ProfileListItemProps> = ({ student, ...props }) => {
  const cgpaColors = getCgpaColor(student.cgpa, student.maxCgpa || 10);

  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 ${props.className || ''}`}>
      {/* Avatar */}
      {student.photoUrl ? (
        <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-xl object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 truncate">{student.name}</h3>
          <span className="text-xs text-slate-400">{student.registerNumber}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{student.department}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">{student.year}</span>
        </div>
      </div>

      {/* CGPA */}
      <div className={`px-3 py-1.5 rounded-lg ${cgpaColors.bg} hidden sm:block`}>
        <span className={`text-sm font-bold ${cgpaColors.text}`}>{student.cgpa.toFixed(2)}</span>
      </div>

      {/* Actions */}
      {props.showActions !== false && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <FileText className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
