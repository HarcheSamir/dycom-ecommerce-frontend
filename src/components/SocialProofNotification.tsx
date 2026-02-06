import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FAKE_NAMES = [
    "Amir S.", "Sarah M.", "Thomas L.", "Lucas R.", "Emma B.", "Jasmine K.", "Mohamed A.", "Sophie D.", "Yanis B.", "Chloé M.",
    "Kevin D.", "Nicolas F.", "Alexandre P.", "Manon G.", "Julie L.", "Léo T.", "Gabriel H.", "Adam E."
];

const ACTIONS = [
    "a rejoint la Dycom Académie",
    "a rejoint la Dycom Académie", 
    "vient de s'inscrire",
    "a commencé sa formation"
];

const SocialProofNotification = () => {
    const [notification, setNotification] = useState<{ name: string; action: string; time: string } | null>(null);

    useEffect(() => {
        const showNotification = () => {
            const randomName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
            const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            
            setNotification({
                name: randomName,
                action: randomAction,
                time: "à l'instant"
            });

            // Hide after 5 seconds
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        };

        // Initial delay
        const initialTimer = setTimeout(showNotification, 5000);

        // Interval between 10-20 seconds
        const intervalId = setInterval(() => {
            const randomDelay = Math.random() * 10000 + 10000; // 10s + 0-10s = 10-20s interval
            setTimeout(showNotification, randomDelay);
        }, 15000); 

        return () => {
            clearTimeout(initialTimer);
            clearInterval(intervalId);
        };
    }, []);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{x: -100, opacity: 0, scale: 0.9}}
                    animate={{x: 0, opacity: 1, scale: 1}}
                    exit={{x: -100, opacity: 0, scale: 0.9}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-6 left-6 z-50 max-w-sm w-full md:w-auto"
                >
                    <div className="bg-[#1C1E22]/90 backdrop-blur-md border border-neutral-700 rounded-xl p-4 shadow-2xl flex items-center gap-4">
                        <div className="bg-primary/20 text-primary w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUserCircle size={28} />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">
                                <span className="text-primary">{notification.name}</span> {notification.action}
                            </p>
                            <p className="text-neutral-500 text-xs mt-0.5">{notification.time}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SocialProofNotification;
