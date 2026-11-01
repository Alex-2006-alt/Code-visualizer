import React from 'react'
import {
  HeroSection,
  HowItWorksSection,
  FeatureDeepDives,
  SandboxSecuritySection,
  AudienceSection,
  LimitsSection,
  FaqSection,
  ClosingCtaSection,
} from '@/components/landing'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full relative overflow-hidden pb-16 selection:bg-accent/20">
      {/* Landing-only extra ambient glows behind hero */}
      <div
        className="absolute top-10 -left-20 w-[560px] h-[560px] rounded-full blur-[130px] pointer-events-none -z-10"
        style={{ background: 'rgba(36, 78, 148, 0.28)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-28 -right-20 w-[560px] h-[560px] rounded-full blur-[130px] pointer-events-none -z-10"
        style={{ background: 'rgba(34, 120, 96, 0.24)' }}
        aria-hidden="true"
      />

      {/* 1. HERO */}
      <HeroSection />

      {/* 2. HOW IT WORKS */}
      <div id="how-it-works" className="w-full">
        <HowItWorksSection />
      </div>

      {/* 3. FEATURE DEEP-DIVES */}
      <div id="features" className="w-full">
        <FeatureDeepDives />
      </div>

      {/* 4. SAFE BY DESIGN (SANDBOX SECURITY) */}
      <div id="security" className="w-full">
        <SandboxSecuritySection />
      </div>

      {/* 5. WHO IT'S FOR */}
      <div id="audience" className="w-full">
        <AudienceSection />
      </div>

      {/* 6. WHAT IT SUPPORTS (LIMITS) */}
      <div id="limits" className="w-full">
        <LimitsSection />
      </div>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <div id="faq" className="w-full">
        <FaqSection />
      </div>

      {/* 8. CLOSING CTA BANNER */}
      <ClosingCtaSection />
    </div>
  )
}
