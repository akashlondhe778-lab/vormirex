import { ArrowRight, BookOpen, Clock, Play, Sparkles, Star, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Course } from '../../types';
import { PublicCourseModal } from './PublicCourseModal';

interface PublicCoursesPreviewProps {
  courses: Course[];
  onOpenAuthForCourse: (course: Course) => void;
}

export const PublicCoursesPreview: React.FC<PublicCoursesPreviewProps> = ({
  courses,
  onOpenAuthForCourse,
}) => {
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState<Course | null>(null);

  // Take top 6 courses for public discovery
  const previewCourses = courses.slice(0, 6);

  return (
    <section id="public-courses" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#272a30]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#3b4a47] bg-[#191c21] mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#58f5e0]">
              Featured Masterclasses
            </span>
          </div>
          <h2 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Popular Courses
          </h2>
          <p className="text-sm sm:text-base text-[#bacac6] mt-2">
            Explore industry-leading courses taught by top verified educators and researchers.
          </p>
        </div>

        <div className="text-xs text-[#bacac6]">
          <span className="font-bold text-[#58f5e0]">{courses.length}+ masterclasses</span> available after sign up
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewCourses.map((course) => (
          <div
            key={course.id}
            className="bg-[#191c21] border border-[#272a30] hover:border-[#3b4a47] rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1.5 group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191c21] via-transparent to-transparent" />

              {/* Free/Price Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-[#2dd8c4] text-[#005a50] text-xs font-black uppercase rounded-full tracking-wider shadow-md">
                  {course.isFree ? 'Free Course' : `₹${course.price.toLocaleString('en-IN')}`}
                </span>
              </div>

              {/* Category */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-0.5 bg-black/70 text-white text-[11px] font-bold rounded-full backdrop-blur-sm border border-white/10">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#bacac6] mb-2">
                  <span className="font-semibold text-[#58f5e0]">{course.level}</span>
                  <div className="flex items-center gap-1 text-[#f59e0b]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">{course.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#58f5e0] transition-colors line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-[#bacac6] mt-2 line-clamp-2 leading-relaxed">
                  {course.subtitle}
                </p>
              </div>

              {/* Instructor */}
              <div className="pt-4 border-t border-[#272a30] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={course.teacherAvatar}
                    alt={course.teacherName}
                    className="w-8 h-8 rounded-full object-cover border border-[#58f5e0]"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{course.teacherName}</p>
                    <p className="text-[10px] text-[#bacac6]">{course.durationHours}h • {course.lessons.length} lessons</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPreviewCourse(course)}
                  className="py-2.5 px-3 rounded-xl bg-[#111319] hover:bg-[#161922] border border-[#3b4a47] text-xs font-bold text-white text-center transition-all cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => onOpenAuthForCourse(course)}
                  className="py-2.5 px-3 rounded-xl bg-[#2dd8c4] hover:bg-[#58f5e0] text-[#005a50] text-xs font-extrabold text-center transition-all shadow-[0_0_15px_rgba(45,216,196,0.25)] cursor-pointer"
                >
                  {course.isFree ? 'Start Course' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Public Course Modal */}
      {selectedPreviewCourse && (
        <PublicCourseModal
          course={selectedPreviewCourse}
          onClose={() => setSelectedPreviewCourse(null)}
          onEnroll={(c) => {
            setSelectedPreviewCourse(null);
            onOpenAuthForCourse(c);
          }}
        />
      )}
    </section>
  );
};
