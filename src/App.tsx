import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserProfileDashboard from './components/UserProfileDashboard';
import EditProfilePage from './components/EditProfilePage';
import { UserProfile } from './types/user';

// Editable fields type (mirrors what EditProfilePage handles)
export interface EditableProfile {
    name: string;
    bio: string;
    github: string;
    linkedin: string;
}

const mockUser: UserProfile = {
    id: '1',
    role: 'STUDENT',
    name: 'Jeyanth',
    location: 'Sri Lanka, Northern Province, Jaffna',
    affiliation: 'University of Peradeniya',
    teamAffiliation: 'Peradeniya',
    bio: 'I am a normal person who is interested in Robotics, coding and AI',
    followers: 0,
    following: 0,
    rank: '2,455,879',
    communityStats: {
        views: 0,
        viewsLastWeek: 0,
        solutions: 0,
        solutionsLastWeek: 0,
        discuss: 0,
        discussLastWeek: 0
    },
    skills: [
        {
            category: 'Advanced',
            items: [
                { name: 'Monotonic Stack', count: 4 }
            ]
        },
        {
            category: 'Intermediate',
            items: [
                { name: 'Hash Table', count: 7 },
                { name: 'Math', count: 5 },
                { name: 'Greedy', count: 2 }
            ]
        },
        {
            category: 'Fundamental',
            items: [
                { name: 'Array', count: 24 },
                { name: 'Two Pointers', count: 14 },
                { name: 'Stack', count: 9 },
                { name: 'String', count: 8 },
                { name: 'Sorting', count: 7 },
                { name: 'Simulation', count: 4 },
                { name: 'Queue', count: 3 }
            ]
        }
    ],
    socialLinks: {
        github: 'https://github.com/Jeyanth3',
        twitter: 'https://x.com/jeyanth',
        linkedin: 'https://linkedin.com/in/lakshigan-jeyanth-aa0681338'
    },
    stats: {
        wins: 5,
        losses: 2,
        draws: 1,
        averageSpeakerPoints: 75.3,
        tournamentsAttended: 5
    },
    history: [
        {
            id: 'm1',
            date: 'Feb 15, 2026',
            motion: 'This house would ban all forms of animal testing.',
            tournamentName: 'Colombo Debate Championship',
            position: 'Proposition',
            result: 'WIN'
        },
        {
            id: 'm2',
            date: 'Jan 20, 2026',
            motion: 'This house believes that the UN has failed its mandate.',
            tournamentName: 'National Inter-University Debates',
            position: 'Opposition',
            result: 'LOSS'
        },
        {
            id: 'm3',
            date: 'Jan 5, 2026',
            motion: 'This house regrets the narrative that one must follow their passion to be successful.',
            tournamentName: 'Kandy Open',
            position: 'Proposition',
            result: 'DRAW'
        }
    ],
    nextMatch: {
        time: '14:00',
        roomNumber: 'A102',
        motion: 'This house supports the implementation of a universal basic income.',
        tournamentName: 'CDC 2026',
        round: 'Finals',
        position: 'Opposition'
    }
};

const App: React.FC = () => {
    const [role, setRole] = React.useState<'STUDENT' | 'JUDGE'>('STUDENT');
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    // Editable profile state – initialized from mock data, will be replaced by
    // a real API fetch (Spring Boot · GET /api/users/{id}/profile) once backend is ready.
    const [editableProfile, setEditableProfile] = React.useState<EditableProfile>({
        name: mockUser.name,
        bio: mockUser.bio ?? '',
        github: mockUser.socialLinks?.github ?? '',
        linkedin: mockUser.socialLinks?.linkedin ?? '',
    });

    const handleEditSave = (data: EditableProfile) => {
        // In production: PUT /api/users/{id}/profile  (Spring Boot · JWT secured)
        setEditableProfile(data);
    };

    const currentUser = {
        ...mockUser,
        name: editableProfile.name,
        bio: editableProfile.bio,
        socialLinks: {
            ...mockUser.socialLinks,
            github: editableProfile.github || undefined,
            linkedin: editableProfile.linkedin || undefined,
        },
        role,
        stats: role === 'STUDENT' ? mockUser.stats : {
            matchesJudged: 12,
            averageJudgeFeedbackScore: 8.5,
            chairCount: 8,
            panelistCount: 4,
            tournamentsJudged: 3
        }
    } as UserProfile;

    const sharedBg = isDarkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-gray-50 text-gray-900';

    return (
        <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${sharedBg}`}>
            <Routes>
                <Route
                    path="/"
                    element={
                        <UserProfileDashboard
                            user={currentUser}
                            isDarkMode={isDarkMode}
                            setIsDarkMode={setIsDarkMode}
                            role={role}
                            setRole={setRole}
                        />
                    }
                />
                <Route
                    path="/edit-profile"
                    element={
                        <EditProfilePage
                            editableProfile={editableProfile}
                            onEditSave={handleEditSave}
                            isDarkMode={isDarkMode}
                            user={currentUser}
                        />
                    }
                />
            </Routes>
        </div>
    );
};

export default App;
