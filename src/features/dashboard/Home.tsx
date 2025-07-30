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
import { BackgroundBeamsWithCollision } from "../../lib/components/ui/background-beams-with-collision";


interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  active?: boolean;
  selectedRole: string; // Added selectedRole prop
}

// Define NoticeProps interface as it was missing
interface NoticeProps {
  title: string;
  content: string;
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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedRole } = useAuth();
  const [open, setOpen] = useState(false);

  const [supervisors, setSupervisors] = useState([]);
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [hasCurrentScholarship, setHasCurrentScholarship] = useState(false);

  // Determine role-specific colors
  const getRoleColors = (role: string) => {
    if (role === "scholar") {
      return {
        primary: "stu-pri", // blue-600
        primaryHover: "stu-pri-hover", // blue-700
        primaryHoverLight: "stu-pri-hover-light", // blue-500
        secondary: "stu-sec", // indigo-500
        secondaryLight: "stu-sec-light", // indigo-300
        accent: "stu-acc", // rose-500
        accentHex: "#eafc83", // Direct hex for accent
        pieColors: ['#2563EB', '#6366F1', '#F43F5E'] // Hex values for Recharts
      };
    } else { // faculty
      return {
        primary: "fac-pri", // violet-600
        primaryHover: "fac-pri-hover", // violet-700
        primaryHoverLight: "fac-pri-hover-light", // violet-500
        secondary: "fac-sec", // sky-500
        secondaryLight: "fac-sec-light", // sky-300
        accent: "fac-acc", // cyan-400
        accentHex: "#fe9496", // Direct hex for accent
        pieColors: ['#7C3AED', '#0EA5E9', '#DA458B'] // Hex values for Recharts
      };
    }
  };

  const roleColors = getRoleColors(selectedRole);
  const remainingDays = getRemainingDays();


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
              selectedRole: selectedRole, // Pass selectedRole
            },
            {
              title: "Pending",
              count: pendingRes?.scholarships?.length || 0,
              icon: "⏳",
              selectedRole: selectedRole, // Pass selectedRole
            },
            {
              title: "Unreleased",
              count: currentRes?.scholarships?.length || 0,
              icon: "🕒",
              selectedRole: selectedRole, // Pass selectedRole
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
              selectedRole: selectedRole, // Pass selectedRole
            },
            {
              title: "Pending Review",
              count: pendingRes?.scholarships?.length || 0,
              icon: "⏳",
              selectedRole: selectedRole, // Pass selectedRole
            },
            {
              title: "Need My Approval",
              count: currentRes?.scholarships?.length || 0,
              icon: "🕒",
              selectedRole: selectedRole, // Pass selectedRole
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

  const totalStats = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

  // Colors for the pie chart slices, now dynamic
  const PIE_COLORS = roleColors.pieColors;

  return (
    
    <div className="px-10 py-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-sans space-y-12">
      {/* Welcome back banner */}
      <BackgroundBeamsWithCollision>
      <div className={`flex items-center justify-between bg-${roleColors.primary} dark:bg-${roleColors.primaryHover} rounded-2xl p-8 shadow-lg transition-all duration-300 border border-gray-200 dark:border-none`}>
        <div className="flex flex-col">
          <p className="text-sm mb-1 text-white">{getFormattedDate()}</p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mt-2"
          >
            <span className="text-white">Welcome back,{" "}</span>
            {/* Applied accent color directly using style prop */}
            <span style={{ color: roleColors.accentHex }}>
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

          <p className={`text-sm text-white`}>
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
      </BackgroundBeamsWithCollision>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Donut Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Scholarship Summary</h2>

            {totalStats > 0 ? (
              // If there's data, show the chart and legend
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between h-72">
                <div className="w-full md:w-2/3 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {PIE_COLORS.map((color, index) => (
                          <linearGradient key={`grad-${index}`} id={`colorUv${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={1}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.8}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Tooltip />
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorUv${index})`} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start justify-center md:justify-start mt-4 md:mt-0 md:ml-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Legend</h3>
                  {pieChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center mb-1">
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      ></span>
                      <span className="text-gray-900 dark:text-gray-300 text-sm">{entry.name} : {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // If there's NO data, show a centered message
              <div className="flex items-center justify-center h-72">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No scholarship data to display yet.
                </p>
              </div>
            )}
          </div>

          {/* Scholarship Notification */}
          {hasCurrentScholarship && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Scholarship Notifications
              </h2>

              <div className={` bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl shadow p-4 transition relative overflow-hidden`}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <div>
                    <h3 className=" hover:bg-gray-100   dark:hover:bg-gray-700 text-base font-semibold">
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
                      <ChevronUp size={18} className={`text-${roleColors.secondaryLight}`} />
                    ) : (
                      <ChevronDown size={18} className={`text-${roleColors.secondaryLight}`} />
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
                      className={`mt-4 inline-block mx-auto text-white  bg-fac-pri-hover-light hover:bg-fac-pri-hover-light rounded-md px-4 py-2 text-sm font-medium  cursor-pointer text-center`}
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
                  className={`aspect-square flex flex-col items-center justify-center text-center p-3 rounded-xl shadow transition bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700`}
                >
                  <img
                    src={`${conf.backend}${sup.src}`}
                    alt={sup.name}
                    onError={(e) => (e.currentTarget.src = photo)}
                    className={`w-24 h-24 rounded-full object-cover border-2 border-${roleColors.primary} mb-4`}
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
            <div className={`bg-${roleColors.primaryHover} rounded-xl p-5 space-y-4`}>
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
const StatCard: React.FC<StatCardProps> = ({ title, count, icon, active, selectedRole }) => {
  const getRoleColors = (role: string) => {
    if (role === "scholar") {
      return {
        primary: "stu-pri",
        primaryHover: "stu-pri-hover",
        secondary: "stu-sec",
        accent: "stu-acc",
      };
    } else { // faculty
      return {
        primary: "fac-pri",
        primaryHover: "fac-pri-hover",
        secondary: "fac-sec",
        accent: "fac-acc",
      };
    }
  };
  const roleColors = getRoleColors(selectedRole);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-${roleColors.primaryHover} text-center py-10 px-4 rounded-xl shadow border border-${roleColors.secondary} hover:bg-${roleColors.primary} transition ${
        active
          ? `bg-${roleColors.primary} border-2 border-${roleColors.accent} scale-[1.02]`
          : ""
      }`}
    >
      {/* <div className="text-4xl mb-3">{icon}</div> */}
      <div className="text-5xl font-extrabold text-white mb-1">{count}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </motion.div>
  );
};

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