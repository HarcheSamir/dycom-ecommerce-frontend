import React, { useState, type FC } from 'react';
import {
    useAdminCourseDetails, useDeleteCourse, useDeleteSection, useDeleteVideo,
    useUpdateVideoOrder, useUpdateSectionOrder
} from '../../hooks/useAdmin';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { FaChevronLeft, FaPlus, FaEdit, FaTrash, FaBars as FaDragHandle, FaBook, FaFilm } from 'react-icons/fa';
import { GlassCard } from './AdminUI';
import {
    AddSectionModal, AddVideoModal, EditSectionModal, EditVideoModal, EditCourseModal
} from './AdminModals';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
export const AdminCourseDetailView: FC<{ courseId: string, onBack: () => void }> = ({ courseId, onBack }) => {
    const { t } = useTranslation();
    const { data: course, isLoading, isError } = useAdminCourseDetails(courseId);

    // Mutations
    const { mutate: deleteCourse } = useDeleteCourse();
    const { mutate: deleteSection } = useDeleteSection();
    const { mutate: deleteVideo } = useDeleteVideo();
    const { mutate: updateVideoOrder } = useUpdateVideoOrder();
    const { mutate: updateSectionOrder } = useUpdateSectionOrder();

    const [modal, setModal] = useState<{ type: 'addSection' | 'addVideo' | 'editSection' | 'editVideo' | 'editCourse', data?: any } | null>(null);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, type } = result;
        if (!destination || !course) return;

        // 1. REORDERING SECTIONS
        if (type === 'SECTION') {
            if (source.index === destination.index) return;
            const newSections = Array.from(course.sections);
            const [movedSection] = newSections.splice(source.index, 1);
            newSections.splice(destination.index, 0, movedSection);
            const updatedOrder = newSections.map((sec, index) => ({ id: sec.id, order: index }));
            updateSectionOrder({ courseId, sections: updatedOrder }, {
                onSuccess: () => toast.success("Section order updated successfully!")
            });
            return;
        }

        // 2. REORDERING VIDEOS
        if (type === 'VIDEO') {
            const sourceSectionId = source.droppableId;
            const destSectionId = destination.droppableId;
            if (sourceSectionId === destSectionId) {
                const section = course.sections.find(s => s.id === sourceSectionId);
                if (!section) return;
                const newVideos = Array.from(section.videos);
                const [movedVideo] = newVideos.splice(source.index, 1);
                newVideos.splice(destination.index, 0, movedVideo);
                const updatedOrder = newVideos.map((video, index) => ({ id: video.id, order: index }));
                updateVideoOrder({ sectionId: sourceSectionId, courseId, videos: updatedOrder });
            } else {
                toast.error(t('adminPage.toasts.dndError'));
            }
        }
    };

    const handleDeleteCourse = () => { if (window.confirm(t('adminPage.confirm.deleteCourse'))) deleteCourse(courseId, { onSuccess: onBack }); };
    const handleDeleteSection = (sectionId: string) => { if (window.confirm(t('adminPage.confirm.deleteSection'))) deleteSection({ sectionId, courseId }); };
    const handleDeleteVideo = (videoId: string) => { if (window.confirm(t('adminPage.confirm.deleteVideo'))) deleteVideo({ videoId, courseId }); };

    if (isLoading) return <p className="text-center p-10 text-neutral-400">{t('adminPage.common.loading')}</p>;
    if (isError) return <p className="text-center p-10 text-red-500">{t('adminPage.common.error')}</p>;

    return (
        <div>
            {/* Modals */}
            {modal?.type === 'addSection' && <AddSectionModal show={true} onClose={() => setModal(null)} courseId={courseId} />}
            {modal?.type === 'addVideo' && <AddVideoModal show={true} onClose={() => setModal(null)} sectionId={modal.data.sectionId} courseId={courseId} />}
            {modal?.type === 'editSection' && <EditSectionModal show={true} onClose={() => setModal(null)} section={modal.data} courseId={courseId} />}
            {modal?.type === 'editVideo' && <EditVideoModal show={true} onClose={() => setModal(null)} video={modal.data} courseId={courseId} />}
            {modal?.type === 'editCourse' && <EditCourseModal show={true} onClose={() => setModal(null)} course={course} />}

            {/* Header */}
            <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6">
                <FaChevronLeft /> {t('adminPage.courseDetail.back')}
            </button>

            <div className="flex items-start gap-6">
                <img src={course?.coverImageUrl || ''} alt={course?.title} className="w-48 h-auto rounded-2xl object-cover" />
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white">{course?.title}</h2>
                    <p className="text-neutral-400 mt-2">{course?.description}</p>
                    <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => setModal({ type: 'addSection' })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold hover:bg-neutral-800">
                            <FaPlus /> {t('adminPage.courseDetail.addSection')}
                        </button>
                        <button onClick={() => setModal({ type: 'editCourse' })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-neutral-800/50 border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800">
                            <FaEdit /> {t('adminPage.courseDetail.edit')}
                        </button>
                        <button onClick={handleDeleteCourse} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-900/40">
                            <FaTrash /> {t('adminPage.courseDetail.delete')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="all-sections" type="SECTION">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                                {course?.sections.map((section, index) => (
                                    <Draggable key={section.id} draggableId={section.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className="relative">
                                                <GlassCard padding="p-5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div {...provided.dragHandleProps} className="cursor-grab text-neutral-500 hover:text-white p-2">
                                                                <FaDragHandle size={20} />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                                                <FaBook className="text-neutral-500" />{section.title}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => setModal({ type: 'addVideo', data: { sectionId: section.id } })} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800 p-2"><FaPlus /></button>
                                                            <button onClick={() => setModal({ type: 'editSection', data: section })} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800 p-2"><FaEdit /></button>
                                                            <button onClick={() => handleDeleteSection(section.id)} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-red-400 font-semibold hover:bg-neutral-800 p-2"><FaTrash /></button>
                                                        </div>
                                                    </div>
                                                    <Droppable droppableId={section.id} type="VIDEO">
                                                        {(provided) => (
                                                            <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                                                                {section.videos.map((video, vIndex) => (
                                                                    <Draggable key={video.id} draggableId={video.id} index={vIndex}>
                                                                        {(provided) => (
                                                                            <li ref={provided.innerRef} {...provided.draggableProps} className="group flex items-center gap-4 p-3 bg-[#111317] rounded-lg">
                                                                                <div {...provided.dragHandleProps} className="text-neutral-500 cursor-grab p-2 -ml-2"><FaDragHandle /></div>
                                                                                <FaFilm className="text-neutral-500 flex-shrink-0" />
                                                                                <Link
                                                                                    to={`/dashboard/training/${courseId}?video=${video.id}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-white flex-1 truncate hover:text-purple-400 hover:underline cursor-pointer transition-colors"
                                                                                    title="Preview this course as a user"
                                                                                >
                                                                                    {video.title}
                                                                                </Link>                                                                                <span className="text-xs text-neutral-400">ID: {video.vimeoId}</span>
                                                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <button onClick={() => setModal({ type: 'editVideo', data: video })} className="p-1 text-neutral-400 hover:text-white"><FaEdit size={12} /></button>
                                                                                    <button onClick={() => handleDeleteVideo(video.id)} className="p-1 text-neutral-400 hover:text-red-400"><FaTrash size={12} /></button>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                                {section.videos.length === 0 && <p className="text-center text-sm text-neutral-500 py-4">{t('adminPage.courseDetail.noVideos')}</p>}
                                                            </ul>
                                                        )}
                                                    </Droppable>
                                                </GlassCard>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            {course?.sections.length === 0 && <p className="text-center text-neutral-500 py-10">{t('adminPage.courseDetail.noSections')}</p>}
        </div>
    );
};