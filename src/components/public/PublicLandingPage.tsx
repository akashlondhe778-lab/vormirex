import React from 'react';
import { Course, PricingPlan } from '../../types';
import { FeaturesSection } from '../FeaturesSection';
import { PricingSection } from '../PricingSection';
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
  onSelectPricingPlan: (plan: PricingPlan, billingCycle: 'monthly' | 'yearly') => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  courses,
  onStartLearning,
  onExploreVormirix,
  onOpenTeacherSignup,
  onOpenAuthForCourse,
  onSelectPricingPlan,
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

      {/* 3b. Core Features (id="features" — linked from the Footer's
          Product > Features link, which previously pointed at nothing
          since this section existed but was never rendered) */}
      <FeaturesSection onOpenStudioTab={onStartLearning} />

      {/* 4. How It Works (Scroll -> Learn -> Grow) */}
      <HowItWorks onStartLearning={onStartLearning} />

      {/* 5. Short Video + Course Concept Breakdown */}
      <ShortVideoConcept onStartLearning={onStartLearning} />

      {/* 6. Popular Courses Public Previews */}
      <PublicCoursesPreview
        courses={courses}
        onOpenAuthForCourse={onOpenAuthForCourse}
      />

      {/* 6b. Pricing Plans (id="pricing" — same situation as Features
          above: existed, had a Footer link, was never rendered) */}
      <PricingSection onSelectPlan={onSelectPricingPlan} />

      {/* 7. For Teachers Section */}
      <ForTeachersSection onStartTeaching={onOpenTeacherSignup} />

      {/* 8. Verified Student & Teacher Testimonials */}
      <TestimonialsSection />

      {/* 9. Final Landing Page CTA */}
      <PublicFinalCTA onStartLearning={onStartLearning} />
    </div>
  );
};
