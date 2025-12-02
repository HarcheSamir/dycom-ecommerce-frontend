import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CourseDetailView } from '../components/training/CourseDetailView';

export const CoursePlayerPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    
    // --- NEW: Grab video ID from URL ---
    const [searchParams] = useSearchParams();
    const videoId = searchParams.get('video');

    if (!courseId) {
        return <div className="text-white p-10">Course ID not found.</div>;
    }

    return (
        <CourseDetailView 
            courseId={courseId} 
            initialVideoId={videoId} // Pass it down
            onBack={() => navigate('/dashboard/training')} 
        />
    );
};