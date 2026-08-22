import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Play,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Course, UserProfile } from '../types';

interface CoursesCatalogProps {
  courses: Course[];
  user: UserProfile;
  onSelectCourse: (course: Course) => void;
  onEnrollOrBuy: (course: Course) => void;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
  courses,
  user,
  onSelectCourse,
  onEnrollOrBuy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          categoryFilter === 'all' || c.category === categoryFilter;

        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === 'free' && c.isFree) ||
          (priceFilter === 'paid' && !c.isFree);

        const matchesDifficulty =
          difficultyFilter === 'all' ||
          c.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

        return matchesSearch && matchesCategory && matchesPrice && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.enrolledCount - a.enrolledCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [courses, searchQuery, categoryFilter, priceFilter, difficultyFilter, sortBy]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#272a30] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#58f5e0] px-2.5 py-1 bg-[#58f5e0]/10 rounded-full border border-[#58f5e0]/20 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Interactive Curriculum</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Masterclasses & Courses
          </h1>
          <p className="text-sm text-[#bacac6] mt-1 max-w-2xl">
            Learn from top educators and engineers with multi-lesson video series, adaptive quizzes, and verified completion credentials.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#bacac6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, instructors, skills..."
            className="w-full bg-[#191c21] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#bacac6]/60 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-[#191c21]/60 border border-[#272a30] p-3.5 rounded-2xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Fields' },
            { id: 'coding', label: '💻 Coding' },
            { id: 'math', label: '📐 Mathematics' },
            { id: 'physics', label: '⚡ Physics' },
            { id: 'chemistry', label: '🧪 Chemistry' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#58f5e0] text-[#005a50] shadow-[0_0_12px_rgba(88,245,224,0.25)]'
                  : 'bg-[#111319] text-[#bacac6] hover:text-white border border-[#272a30]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Price, Difficulty, Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Selector */}
          <div className="flex bg-[#111319] border border-[#272a30] rounded-xl p-1 text-xs font-semibold">
            {(['all', 'free', 'paid'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriceFilter(p)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  priceFilter === p
                    ? 'bg-[#2dd8c4] text-[#005a50]'
                    : 'text-[#bacac6] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-[#111319] border border-[#272a30] text-[#bacac6] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#58f5e0]"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#111319] border border-[#272a30] text-[#bacac6] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#58f5e0]"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="py-16 text-center bg-[#191c21] rounded-2xl border border-[#272a30]">
          <BookOpen className="w-12 h-12 text-[#3b4a47] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No courses match your filters</h3>
          <p className="text-xs text-[#bacac6] mb-4">Try clearing filters or search terms.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setPriceFilter('all');
              setDifficultyFilter('all');
            }}
            className="px-4 py-2 bg-[#2dd8c4] text-[#005a50] rounded-full font-bold text-xs uppercase cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = user.enrolledCourseIds?.includes(course.id);

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="bg-[#191c21] border border-[#272a30] hover:border-[#58f5e0]/60 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col group cursor-pointer"
              >
                {/* Thumbnail Header */}
                <div className="relative h-44 overflow-hidden bg-black/40">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191c21] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#58f5e0] border border-[#58f5e0]/30">
                      {course.category}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        course.isFree
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#58f5e0]/20 text-[#58f5e0] border border-[#58f5e0]/40'
                      }`}
                    >
                      {course.isFree ? 'Free Course' : `₹${course.price}`}
                    </span>
                  </div>

                  {/* Duration & Lessons pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-[#58f5e0]" />
                    <span>{course.lessons.length} Lessons</span>
                    <span>•</span>
                    <span>{course.difficulty}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating & Students */}
                    <div className="flex items-center justify-between text-xs text-[#bacac6] mb-2">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating}</span>
                        <span className="text-[#bacac6] font-normal">
                          ({course.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#58f5e0]" />
                        <span>{course.enrolledCount.toLocaleString()} enrolled</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-[#58f5e0] transition-colors line-clamp-2 mb-1.5 leading-snug">
                      {course.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-[#bacac6] line-clamp-2 mb-4 leading-relaxed">
                      {course.subtitle || course.description}
                    </p>
                  </div>

                  {/* Footer: Instructor & CTA */}
                  <div className="pt-4 border-t border-[#272a30] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={course.teacherAvatar}
                        alt={course.teacherName}
                        className="w-7 h-7 rounded-full object-cover border border-[#3b4a47]"
                      />
                      <span className="text-xs font-semibold text-white/90 truncate">
                        {course.teacherName}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnrollOrBuy(course);
                      }}
                      className={`text-xs uppercase font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                        isEnrolled
                          ? 'bg-[#1d2025] text-[#58f5e0] border border-[#58f5e0]/50 hover:bg-[#58f5e0]/10'
                          : course.isFree
                          ? 'bg-[#2dd8c4] text-[#005a50] hover:scale-95 shadow-[0_0_12px_rgba(45,216,196,0.25)]'
                          : 'bg-[#2dd8c4] text-[#005a50] hover:scale-95 shadow-[0_0_12px_rgba(45,216,196,0.25)]'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </>
                      ) : course.isFree ? (
                        <span>Enroll Free</span>
                      ) : (
                        <span>Buy ₹{course.price}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
