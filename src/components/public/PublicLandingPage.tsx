import React from 'react';
import { Course } from '../../types';
import { FeaturesSection } from '../FeaturesSection';
import { StatsSection } from '../StatsSection';
import { TestimonialsSection } from '../TestimonialsSection';
import { ForTeachersSection } from './ForTeachersSection';
import { HowItWorks } from './HowItWorks';
import { PublicCoursesPreview } from './PublicCoursesPreview';
import { PublicFinalCTA } from './PublicFinalCTA';
import { PublicHero } from './PublicHero';
import { ShortVideoConcept } from './ShortVideoConcept';
import { WhyVormirix } from './WhyVormirix';

interface PublicLandingPageProps {
  courses: Course[];
  onStartLearning: () => void;
  onExploreVormirix: () => void;
  onOpenTeacherSignup: () => void;
  onOpenAuthForCourse: (course: Course) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  courses,
  onStartLearning,
  onExploreVormirix,
  onOpenTeacherSignup,
  onOpenAuthForCourse,
}) => {
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <PublicHero
        onStartLearning={onStartLearning}
        onExploreVormirix={onExploreVormirix}
        onOpenTeacherSignup={onOpenTeacherSignup}
      />

      {/* 2. Key Stats Bar */}
      <StatsSection />

      {/* 3. Why Vormirix Section */}
      <WhyVormirix />

      {/* 4. How It Works (Scroll -> Learn -> Grow) */}
      <HowItWorks onStartLearning={onStartLearning} />

      {/* 5. Short Video + Course Concept Breakdown */}
      <ShortVideoConcept onStartLearning={onStartLearning} />

      {/* 6. Popular Courses Public Previews */}
      <PublicCoursesPreview
        courses={courses}
        onOpenAuthForCourse={onOpenAuthForCourse}
      />

      {/* 7. For Teachers Section */}
      <ForTeachersSection onStartTeaching={onOpenTeacherSignup} />

      {/* 8. Verified Student & Teacher Testimonials */}
      <TestimonialsSection />

      {/* 9. Final Landing Page CTA */}
      <PublicFinalCTA onStartLearning={onStartLearning} />
    </div>
  );
};
