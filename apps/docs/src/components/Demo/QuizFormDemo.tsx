import React, { useEffect, useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import VariantSelector from './VariantSelector';
import QuizForm, { CardVariantType, Question } from '../UI/quiz-form';
import { useColorMode } from '@docusaurus/theme-common';

const cardVariants: CardVariantType[] = ['default', 'gradient', 'bordered', 'dark'];

const feedbackQuestions: Question[] = [
    { id: 'discovery', type: 'single', question: 'How did you first hear about us?', options: ['Social Media', 'Search Engine', 'Friend / Referral', 'Advertisement', 'Event or Conference'], required: true },
    { id: 'features', type: 'multiple', question: 'Which features are most important to you?', hint: 'Select all that apply', options: ['Ease of Use', 'Performance', 'Customization', 'Integrations', 'Support', 'Pricing'], required: true },
    { id: 'satisfaction', type: 'rating', question: 'How satisfied are you with our product overall?', scale: 5, required: true },
    { id: 'nps', type: 'rating', question: 'How likely are you to recommend us to a friend?', scale: 10, required: true },
];

const onboardingQuestions: Question[] = [
    { id: 'role', type: 'single', question: 'What best describes your role?', options: ['Designer', 'Developer', 'Product Manager', 'Marketer', 'Other'], required: true },
    { id: 'teamSize', type: 'single', question: 'How large is your team?', options: ['Just me', '2–10', '11–50', '51–200', '200+'], required: true },
    { id: 'goals', type: 'multiple', question: 'What are your main goals?', hint: 'Pick everything that applies', options: ['Increase Productivity', 'Better Collaboration', 'Save Costs', 'Improve Quality', 'Scale Faster'], required: true },
    { id: 'experience', type: 'rating', question: 'How would you rate your setup experience?', scale: 5, required: true },
];

export const QuizFormDemo = () => {
    const { colorMode } = useColorMode();
    const [cardVariant, setCardVariant] = useState<CardVariantType>('default');
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [showResult, setShowResult] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const questions = isOnboarding ? onboardingQuestions : feedbackQuestions;
    const stepLabels = isOnboarding ? ['Role', 'Team', 'Goals', 'Experience'] : undefined;

    useEffect(() => {
        setTheme(colorMode === 'dark' ? 'dark' : 'light');
    }, [colorMode]);

    const isCardVariant = (v: string): v is CardVariantType => {
        return cardVariants.includes(v as CardVariantType);
    };

    const generateCodeString = () => {
        const stepLabelsStr = isOnboarding ? `\n    stepLabels={['Role', 'Team', 'Goals', 'Experience']}` : '';
        
        return `
import { QuizForm } from '@ignix-ui/quizform';
const questions = [
    { id: 'q1', type: 'single', question: 'How did you hear about us?', options: ['Social Media', 'Search', 'Referral'], required: true },
    { id: 'q2', type: 'multiple', question: 'Which features matter most?', hint: 'Select all that apply', options: ['Speed', 'Design', 'Price'], required: true },
    { id: 'q3', type: 'rating', question: 'Overall satisfaction', scale: 5, required: true },
];

<QuizForm
    questions={questions}
    onSubmit={(answers) => console.log(answers)}
    cardVariant="${cardVariant}"
    showResult={${showResult}}${stepLabelsStr}
    submitLabel="Submit"
    nextLabel="Continue"
    backLabel="Back"
/>`;
    };

    const preview = (
        <QuizForm
            key={`${cardVariant}-${isOnboarding}`}
            questions={questions}
            onSubmit={(answers) => console.log('[QuizForm]', answers)}
            cardVariant={cardVariant}
            showResult={showResult}
            stepLabels={stepLabels}
            submitLabel={isOnboarding ? 'Finish Setup' : 'Submit'}
            nextLabel={isOnboarding ? 'Next Step' : 'Continue'}
            backLabel="Back"
            className="min-h-0"
            theme={theme}
        />
    );

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                <VariantSelector
                    variants={[...cardVariants]}
                    selectedVariant={cardVariant}
                    onSelectVariant={(v) => {
                        if (!isCardVariant(v)) return;
                      
                        setCardVariant(v);
                      
                        if (v === 'dark') setTheme('dark');
                        else setTheme(colorMode === 'dark' ? 'dark' : 'light');
                    }}
                    type="Card Variant"
                />
            </div>
            <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isOnboarding} onChange={(e) => setIsOnboarding(e.target.checked)} className="rounded" />
                        <span className="text-sm">Onboarding Mode</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={showResult} onChange={(e) => setShowResult(e.target.checked)} className="rounded" />
                        <span className="text-sm">Show Result</span>
                    </label>
                </div>
            </div>
            <Tabs>
                <TabItem value="preview" label="Preview">
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="p-3">{preview}</div>
                    </div>
                </TabItem>
                <TabItem value="code" label="Code">
                    <CodeBlock language="tsx">{generateCodeString()}</CodeBlock>
                </TabItem>
            </Tabs>
        </div>
    );
};
