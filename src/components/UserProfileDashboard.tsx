import React from 'react';
import { UserProfile, StudentProfile, JudgeProfile, NextMatch } from '../types/user';

interface UserProfileDashboardProps {
    user: UserProfile;
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    role: 'STUDENT' | 'JUDGE';
    setRole: (val: 'STUDENT' | 'JUDGE') => void;
}

const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
    user,
    isDarkMode,
    setIsDarkMode,
    role,
    setRole
}) => {
    const isStudent = role === 'STUDENT';
    const isJudge = role === 'JUDGE';

    const textMutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const cardBgClass = isDarkMode ? 'bg-[#282828] border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900';
    const hoverBgClass = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar (From preferred second iteration) */}
            <header className={`sticky top-0 z-30 w-full border-b backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
                <div className="flex items-center gap-4 flex-1">
                    <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                        DMS
                    </div>
                </div>

                <div className="flex-1 max-w-lg hidden sm:flex items-center">
                    <div className={`relative w-full flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-blue-500/50 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                        <div className="pl-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search matches, debaters, motions..."
                            className={`w-full py-2 pl-2 pr-4 bg-transparent outline-none text-sm ${isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Toggle Theme"
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                    <button className={`p-2 rounded-lg transition-colors relative ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full outline outline-2 outline-white dark:outline-[#1a1a1a]"></span>
                    </button>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-1 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                        {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="User" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="max-w-[1280px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">

                {/* Left Sidebar */}
                <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
                    <div className={`rounded-xl shadow-sm border p-6 flex flex-col ${cardBgClass}`}>
                        {/* Avatar & Details */}
                        <div className="flex gap-4 items-center">
                            <div className="relative w-24 h-24 shrink-0">
                                {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
                                ) : (
                                    <div className={`w-full h-full rounded-2xl flex items-center justify-center shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold leading-tight">{user.name}</h1>
                                <p className={`text-sm mb-2 ${textMutedClass}`}>{user.name.toLowerCase()}</p>
                                {user.rank && (
                                    <div className="text-sm">
                                        <span className={textMutedClass}>Rank</span> <span className="font-bold">{user.rank}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Role Toggle & Edit Profile (Integrated from preferred Image 2) */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className={`p-1 rounded-lg flex border w-full ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                                <button
                                    onClick={() => setRole('STUDENT')}
                                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${isStudent ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Debater
                                </button>
                                <button
                                    onClick={() => setRole('JUDGE')}
                                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${isJudge ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Judge
                                </button>
                            </div>
                            <button className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors border ${isDarkMode ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>
                                Edit Profile
                            </button>
                        </div>

                        <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                        {/* Bio & Affiliations */}
                        <div className="space-y-4">
                            {user.bio && (
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-sm mt-4">
                                <div><span className="font-bold">{user.following}</span> <span className={textMutedClass}>Following</span></div>
                                <div className={`w-px h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                <div><span className="font-bold">{user.followers}</span> <span className={textMutedClass}>Followers</span></div>
                            </div>

                            <div className="space-y-4 pt-4">
                                {user.location && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 ${textMutedClass}`}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        <span className="font-medium">{user.location}</span>
                                    </div>
                                )}
                                {user.affiliation && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 ${textMutedClass}`}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                        <span className="font-medium">{user.affiliation}</span>
                                    </div>
                                )}
                                {user.teamAffiliation && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 ${textMutedClass}`}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        <span className="font-medium">{user.teamAffiliation}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                        {/* Social Links Row */}
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold uppercase tracking-wider ${textMutedClass} mr-2`}>Community</span>
                            {user.socialLinks?.github && (
                                <a href={user.socialLinks.github} className={`p-2 rounded-lg transition-colors ${hoverBgClass} ${textMutedClass} hover:text-current`} title="GitHub">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                </a>
                            )}
                            {user.socialLinks?.linkedin && (
                                <a href={user.socialLinks.linkedin} className={`p-2 rounded-lg transition-colors ${hoverBgClass} ${textMutedClass} hover:text-current`} title="LinkedIn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                </a>
                            )}
                            {user.socialLinks?.twitter && (
                                <a href={user.socialLinks.twitter} className={`p-2 rounded-lg transition-colors ${hoverBgClass} ${textMutedClass} hover:text-current`} title="Twitter">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                </a>
                            )}
                        </div>

                        {/* Community Stats */}
                        {user.communityStats && (
                            <div className="mt-4 border-t pt-6 border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-sm mb-4">Community Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            <span className="text-sm">Views</span>
                                            <span className="font-semibold text-sm ml-1">{user.communityStats.views}</span>
                                        </div>
                                        <span className={`text-[11px] ml-7 ${textMutedClass}`}>Last week {user.communityStats.viewsLastWeek}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                                            <span className="text-sm">Solution</span>
                                            <span className="font-semibold text-sm ml-1">{user.communityStats.solutions}</span>
                                        </div>
                                        <span className={`text-[11px] ml-7 ${textMutedClass}`}>Last week {user.communityStats.solutionsLastWeek}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                            <span className="text-sm">Discuss</span>
                                            <span className="font-semibold text-sm ml-1">{user.communityStats.discuss}</span>
                                        </div>
                                        <span className={`text-[11px] ml-7 ${textMutedClass}`}>Last week {user.communityStats.discussLastWeek}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </aside>

                {/* Right Main Column */}
                <div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-hidden">

                    {/* Visual Stats Block & Up Next Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {isStudent ? (
                            <StudentStatsBlock stats={(user as StudentProfile).stats} isDarkMode={isDarkMode} cardBgClass={cardBgClass} textMutedClass={textMutedClass} />
                        ) : (
                            <JudgeStatsBlock stats={(user as JudgeProfile).stats} isDarkMode={isDarkMode} cardBgClass={cardBgClass} textMutedClass={textMutedClass} />
                        )}
                        <div className="w-full xl:col-span-1 md:col-span-2">
                            <UpNextCard match={user.nextMatch} isJudge={isJudge} isDarkMode={isDarkMode} />
                        </div>
                    </div>

                    {/* Match History Table */}
                    <div className="flex-1">
                        <HistoryTable history={user.history} isJudge={isJudge} isDarkMode={isDarkMode} />
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Sub Components ---

const StudentStatsBlock = ({ stats, isDarkMode, cardBgClass, textMutedClass }: { stats: StudentProfile['stats']; isDarkMode: boolean; cardBgClass: string; textMutedClass: string }) => {
    const totalMatches = stats.wins + stats.losses + (stats.draws || 0);
    const winRate = totalMatches > 0 ? ((stats.wins / totalMatches) * 100).toFixed(0) : 0;
    const offset = 226.2 - ((226.2 * Number(winRate)) / 100);

    return (
        <>
            {/* Column 1: Overview */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                <h3 className="font-semibold text-sm mb-4">Overview</h3>
                <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                            <circle className={isDarkMode ? 'text-gray-800' : 'text-gray-200'} strokeWidth="6" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
                            <circle className="text-green-500 transition-all duration-1000 ease-out" strokeWidth="6" strokeDasharray="226.2" strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                            <span className="text-xl font-bold">{winRate}%</span>
                            <span className={`text-[9px] font-bold uppercase ${textMutedClass}`}>Win Rate</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2.5 text-sm font-medium">
                        <div className="flex justify-between items-center">
                            <span className={textMutedClass}>Total Matches</span>
                            <span>{totalMatches}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-green-500">Wins</span>
                            <span>{stats.wins}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-red-500">Losses</span>
                            <span>{stats.losses}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2: Stacked Cards */}
            <div className="flex flex-col gap-4">
                <div className={`p-5 rounded-xl border flex-1 flex flex-col justify-center relative ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedClass}`}>Format Performance</h3>
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <span>{stats.wins}W</span>
                        <span className={textMutedClass}>-</span>
                        <span>{stats.losses}L</span>
                        {stats.draws !== undefined && stats.draws > 0 && (
                            <>
                                <span className={textMutedClass}>-</span>
                                <span>{stats.draws}D</span>
                            </>
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-xl">🏆</div>
                </div>

                <div className={`p-5 rounded-xl border flex-1 flex flex-col justify-center relative ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedClass}`}>Avg. Speaker Points</h3>
                    <div className="text-2xl font-bold">{stats.averageSpeakerPoints}</div>
                    <div className="absolute right-4 bottom-4 text-xl text-yellow-500">⭐</div>
                </div>
            </div>
        </>
    );
};

const JudgeStatsBlock = ({ stats, isDarkMode, cardBgClass, textMutedClass }: { stats: JudgeProfile['stats']; isDarkMode: boolean; cardBgClass: string; textMutedClass: string }) => {
    return (
        <>
            {/* Column 1: Overview */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                <h3 className="font-semibold text-sm mb-4">Overview</h3>
                <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                            <circle className={isDarkMode ? 'text-gray-800' : 'text-gray-200'} strokeWidth="6" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
                            <circle className="text-indigo-500 transition-all duration-1000 ease-out" strokeWidth="6" strokeDasharray="226.2" strokeDashoffset="40" strokeLinecap="round" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-indigo-500">{stats.matchesJudged}</span>
                            <span className={`text-[9px] font-bold uppercase ${textMutedClass}`}>Matches</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2.5 text-sm font-medium">
                        <div className="flex justify-between items-center">
                            <span className={textMutedClass}>Tournaments</span>
                            <span>{stats.tournamentsJudged}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-indigo-400">Chair</span>
                            <span>{stats.chairCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-purple-400">Panelist</span>
                            <span>{stats.panelistCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column 2: Stacked Cards */}
            <div className="flex flex-col gap-4">
                <div className={`p-5 rounded-xl border flex-1 flex flex-col justify-center relative ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedClass}`}>Avg. Feedback Score</h3>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">{stats.averageJudgeFeedbackScore.toFixed(1)} <span className={`text-sm tracking-normal ${textMutedClass} ml-1`}>/ 10</span></div>
                    <div className="absolute right-4 bottom-4 text-xl">📝</div>
                </div>

                <div className={`p-5 rounded-xl border flex-1 flex flex-col justify-center relative ${cardBgClass} ${isDarkMode ? 'bg-[#212121]' : ''}`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMutedClass}`}>Chairing Rate</h3>
                    <div className="text-2xl font-bold">{stats.matchesJudged > 0 ? ((stats.chairCount / stats.matchesJudged) * 100).toFixed(0) : 0}%</div>
                    <div className="absolute right-4 bottom-4 text-xl">⚖️</div>
                </div>
            </div>
        </>
    );
};

const UpNextCard = ({ match, isJudge, isDarkMode }: { match?: NextMatch; isJudge: boolean; isDarkMode: boolean }) => {
    if (!match) {
        return (
            <div className={`h-full rounded-xl shadow-sm border p-6 flex flex-col justify-center items-center ${isDarkMode ? 'bg-[#282828] border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming matches.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl p-5 flex flex-col justify-between text-white" style={{ background: 'linear-gradient(135deg, #2b2762 0%, #352a84 100%)' }}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-200">Up Next</span>
                </div>
                {match.position && !isJudge && (
                    <span className="px-2.5 py-1 rounded bg-indigo-500/40 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30 shadow-sm">
                        {match.position}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-center my-4">
                <h2 className="text-lg font-bold leading-tight mb-1">{match.tournamentName}</h2>
                <p className="text-sm text-indigo-200 font-medium">{match.round}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/20 text-indigo-100 text-xs font-semibold backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {match.time}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/20 text-indigo-100 text-xs font-semibold backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    {match.roomNumber}
                </div>
            </div>
        </div>
    );
};

const HistoryTable = ({ history, isJudge, isDarkMode }: { history: UserProfile['history']; isJudge: boolean; isDarkMode: boolean }) => {
    return (
        <div className={`rounded-xl shadow-sm border overflow-hidden h-full flex flex-col ${isDarkMode ? 'bg-[#282828] border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-5 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Matches</h2>
                <a href="#" className="font-semibold text-sm text-blue-500 hover:text-blue-400">View All</a>
            </div>

            {history.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6 pb-12">
                    <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No past matches found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400 bg-gray-900/50' : 'text-gray-500 bg-gray-50'}`}>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Tournament</th>
                                <th className="px-6 py-3 font-semibold hidden sm:table-cell">Motion</th>
                                <th className="px-6 py-3 font-semibold hidden md:table-cell">Side</th>
                                <th className="px-6 py-3 font-semibold text-right">Result</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {history.map((match) => (
                                <tr key={match.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {new Date(match.date).toLocaleDateString() === 'Invalid Date' ? match.date : new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>

                                    <td className={`px-6 py-4 font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {match.tournamentName}
                                    </td>

                                    <td className={`px-6 py-4 max-w-xs xl:max-w-md hidden sm:table-cell truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <div className="truncate cursor-pointer hover:text-blue-500 transition-colors" title={match.motion}>
                                            {match.motion}
                                        </div>
                                    </td>

                                    <td className={`px-6 py-4 whitespace-nowrap hidden md:table-cell ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {match.position || '-'}
                                    </td>

                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {isJudge ? (
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                {match.winningTeam || 'N/A'}
                                            </span>
                                        ) : (
                                            <ResultBadge result={match.result} isDarkMode={isDarkMode} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const ResultBadge = ({ result, isDarkMode }: { result?: 'WIN' | 'LOSS' | 'DRAW'; isDarkMode: boolean }) => {
    if (!result) return <span className="text-gray-400">-</span>;

    let badgeClass = '';
    let label: string = result;

    switch (result) {
        case 'WIN':
            badgeClass = isDarkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200';
            label = 'W';
            break;
        case 'LOSS':
            badgeClass = isDarkMode ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200';
            label = 'L';
            break;
        case 'DRAW':
            badgeClass = isDarkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-700 border-gray-300';
            label = 'D';
            break;
    }

    return (
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-xs font-bold border ${badgeClass}`} title={result}>
            {label}
        </span>
    );
};

export default UserProfileDashboard;
