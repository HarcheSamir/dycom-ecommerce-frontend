import type { FC } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCourse } from '../../hooks/useTraining';
import { CourseDisplay } from './CourseDisplay';

interface CourseDetailViewProps {
    courseId: string;
    initialVideoId?: string | null; // New Prop
    onBack: () => void;
}

export const CourseDetailView: FC<CourseDetailViewProps> = ({ courseId, initialVideoId, onBack }) => {
    const { t } = useTranslation();
    const { data: course, isLoading, isError } = useCourse(courseId);

    if (isLoading && !course) {
        return <p className="text-center text-neutral-400 p-10">{t('trainingPage.detailView.loading')}</p>;
    }

    if (isError && !course) {
        return <p className="text-center text-red-500 p-10">{t('trainingPage.detailView.error')}</p>;
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <FaChevronLeft />
                <span>{t('trainingPage.detailView.backButton')}</span>
            </button>

            {course ? (
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-neutral-400 mt-1 mb-8">{course.description}</p>
                    {/* Pass the prop here */}
                    <CourseDisplay course={course} initialVideoId={initialVideoId} />
                </div>
            ) : null}
        </main>
    );
};