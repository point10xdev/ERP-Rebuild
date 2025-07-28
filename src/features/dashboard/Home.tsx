import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import conf from "../../types/conf.json";
import { useAuth } from "../auth/store/customHooks";
import photo from "../../assets/photos/photo.png";
// import { Scholarship } from "../../types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getMembers, getScholarships } from "../../services/index";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  active?: boolean;
}

const getFormattedDate = (): string => {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
const getRemainingDays = () => {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const diffTime = endOfMonth.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
const remainingDays = getRemainingDays();

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedRole } = useAuth();
  const [open, setOpen] = useState(false);

  const [supervisors, setSupervisors] = useState([]);
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [hasCurrentScholarship, setHasCurrentScholarship] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch supervisors based on selected role
    const fetchSupervisors = async () => {
      try {
        const newMembers = await getMembers({
          id: user.id,
          role: selectedRole,
        });
        if (Array.isArray(newMembers)) {
          setSupervisors(newMembers);
        }
      } catch (error) {
        console.error("Failed to fetch supervisors:", error);
      }
    };

    

    // Fetch scholarship stats depending on user role
    const fetchScholarshipStats = async () => {
      try {
        let totalRes, pendingRes, currentRes;

        if (selectedRole === "scholar") {
          [totalRes, pendingRes, currentRes] = await Promise.all([
            getScholarships({ scholar: user.id }),
            getScholarships({ scholar: user.id, type: "pending" }),
            getScholarships({ scholar: user.id, type: "current" }),
          ]);

          setStats([
            {
              title: "Total",
              count: totalRes?.scholarships?.length || 0,
              icon: "✅",
            },
            {
              title: "Pending",
              count: pendingRes?.scholarships?.length || 0,
              icon: "⏳",
            },
            {
              title: "Unreleased",
              count: currentRes?.scholarships?.length || 0,
              icon: "🕒",
            },
          ]);

          setHasCurrentScholarship((currentRes?.scholarships?.length || 0) > 0);
        } else {
          [totalRes, pendingRes, currentRes] = await Promise.all([
            getScholarships({ faculty: user.id, role: selectedRole }),
            getScholarships({
              faculty: user.id,
              role: selectedRole,
              type: "pending",
            }),
            getScholarships({
              faculty: user.id,
              role: selectedRole,
              type: "role_pending",
            }),
          ]);

          setStats([
            {
              title: "All Students",
              count: totalRes?.scholarships?.length || 0,
              icon: "✅",
            },
            {
              title: "Pending Review",
              count: pendingRes?.scholarships?.length || 0,
              icon: "⏳",
            },
            {
              title: "Need My Approval",
              count: currentRes?.scholarships?.length || 0,
              icon: "🕒",
            },
          ]);

          setHasCurrentScholarship((currentRes?.scholarships?.length || 0) > 0);
        }
      } catch (error) {
        console.error("Failed to fetch scholarship stats:", error);
      }
    };

    fetchSupervisors();
    fetchScholarshipStats();
  }, [user?.id, selectedRole]);

  // Data for the pie chart, transformed from stats state
  const pieChartData = stats.map(stat => ({
    name: stat.title,
    value: stat.count,
  }));

  // Colors for the pie chart slices
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
  
  return (
     <div className="px-10 py-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-sans space-y-12">
      <div className="flex items-center justify-between bg-purple-600 dark:bg-purple-700 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.005] transition-all duration-300 border border-gray-200 dark:border-none">
        <div className="flex flex-col">
          <p className="text-sm mb-1">{getFormattedDate()}</p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mt-2"
          >
            Welcome back,{" "}
            <span className="text-purple-300">
              <Typewriter
                words={[user?.name || "NULL"]}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </span>
          </motion.h1>

          <p className="text-sm text-purple-200">
            Always stay updated in your student portal
          </p>
        </div>
        <div className="w-40 h-40">
          {/* <img
            src="/student-avatar.png"
            alt="Student Avatar"
            className="object-contain w-full h-full"
          /> */}
        </div>
      </div>
            
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Scholarship Stats */}
          {/* <div>
            <h2 className="text-xl font-semibold mb-4">Scholarship Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {stats.map((stat, idx) => (
                <StatCard
                  key={idx}
                  title={stat.title}
                  count={stat.count}
                  icon={stat.icon}
                  active={stat.active}
                />
              ))} */}
{/* Pie Chart Section (replaces Scholarship Stats) - ONLY CHANGES HERE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Scholarship Summary</h2> {/* Kept original h2 classes */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between h-72"> {/* Adjusted height and flex for layout */}
                <div className="w-full md:w-2/3 h-full"> {/* Chart occupies 2/3 width on medium screens */}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80} // Adjust outerRadius for size
                                fill="#8884d8"
                                dataKey="value"
                                // Removed the label prop here to prevent cutoff/overlap
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip /> {/* Tooltip for showing values on hover */}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start justify-center md:justify-start mt-4 md:mt-0 md:ml-4"> {/* Legend section occupies 1/3 width */}
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Legend</h3> {/* Kept default text color, can be adjusted */}
                    {pieChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center mb-1">
                            <span
                                className="inline-block w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span className="text-gray-900 dark:text-gray-300 text-sm">{entry.name}</span> {/* Kept default text color, can be adjusted */}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Scholarship Notification */}
          {hasCurrentScholarship && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Scholarship Notifications
              </h2>

              <div className="bg-gray-800 rounded-xl shadow p-4 transition relative overflow-hidden">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <div>
                    <h3 className="text-white text-base font-semibold">
                      🎓 Unreleased Scholarships Found
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        remainingDays <= 10 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {remainingDays} days left
                    </span>
                    {open ? (
                      <ChevronUp size={18} className="text-purple-300" />
                    ) : (
                      <ChevronDown size={18} className="text-purple-300" />
                    )}
                  </div>
                </div>

                {/* AnimatePresence handles exit animation */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 inline-block mx-auto bg-purple-700 hover:bg-purple-600 rounded-md px-4 py-2 text-sm font-medium text-white cursor-pointer text-center"
                      onClick={() =>
                        navigate(
                          selectedRole === "scholar"
                            ? "/dashboard/student/scholarship/"
                            : "/dashboard/scholarship/approve"
                        )
                      }
                    >
                      View & Release Now →
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Right (1/3) */}
        <div className="space-y-10">
          {/* Supervisors */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {supervisors.map((sup, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.1, // 👈 stagger animation
                    ease: "easeOut",
                  }}
                  className="aspect-square flex flex-col items-center justify-center text-center bg-gray-800 p-3 rounded-xl shadow hover:bg-gray-700 transition"
                >
                  <img
                    src={`${conf.backend}${sup.src}`}
                    alt={sup.name}
                    onError={(e) => (e.currentTarget.src = photo)}
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 mb-4"
                  />
                  <p className="text-sm font-medium">{sup.name}</p>
                  <p className="text-xs text-gray-400">{sup.role}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Daily Notices */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Daily Notice</h2>
              {/* <button className="text-purple-400 hover:underline">
                See all
              </button> */}
            </div>
            <div className="bg-gray-800 rounded-xl p-5 space-y-4">
              <Notice
                title="Beta Version Notice"
                content="The site is under beta version. Developers are working to improve the site. Please provide any bugs or suggestions using the feedback form."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Components
const StatCard: React.FC<StatCardProps> = ({ title, count, icon, active }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`bg-gray-800 text-center py-10 px-4 rounded-xl shadow border border-gray-700 hover:bg-gray-700 transition ${
      active
        ? "bg-purple-800 border-2 border-purple-500 scale-[1.02]"
        : "bg-gray-800"
    }`}
  >
    {/* <div className="text-4xl mb-3">{icon}</div> */}
    <div className="text-5xl font-extrabold text-white mb-1">{count}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </motion.div>
);

const Notice: React.FC<NoticeProps> = ({ title, content }) => (
  <motion.div
    initial={{ x: 40, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <h4 className="text-sm font-semibold">{title}</h4>
    <p className="text-xs text-gray-400">{content}</p>
  </motion.div>
);
