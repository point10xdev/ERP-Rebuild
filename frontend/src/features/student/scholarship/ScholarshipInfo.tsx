import { useEffect, useState } from 'react';
import { scholarshipService } from '../../../services/api';
import { Scholarship, ScholarshipStatus, Stage } from '../../../types/schema';

interface ScholarshipInfoProps {
  studentId: string;
}

export const ScholarshipInfo = ({ studentId }: ScholarshipInfoProps) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const data = await scholarshipService.getScholarshipsByStudent(studentId);
        setScholarships(data);
      } catch (err) {
        setError('Failed to load scholarship data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [studentId]);

  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedScholarship) return;
      
      try {
        const data = await scholarshipService.getScholarshipStages(selectedScholarship);
        setStages(data);
      } catch (err) {
        console.error('Failed to load stages:', err);
      }
    };

    if (selectedScholarship) {
      fetchStages();
    }
  }, [selectedScholarship]);

  const handleScholarshipSelect = (id: string) => {
    setSelectedScholarship(id);
  };

  const getStatusColor = (status: ScholarshipStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'paid': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-300">Loading scholarship information...</p>;
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400">{error}</p>;
  }

  if (scholarships.length === 0) {
    return <p className="text-gray-600 dark:text-gray-300">No scholarship information available.</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 dark:text-white">Scholarship Information</h3>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* List of scholarships */}
        <div className="lg:w-1/2">
          <h4 className="font-medium mb-2 dark:text-white">Scholarships</h4>
          <div className="space-y-2">
            {scholarships.map((scholarship) => (
              <div 
                key={scholarship.id}
                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700 dark:bg-gray-800 ${
                  selectedScholarship === scholarship.id ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/50' : ''
                }`}
                onClick={() => handleScholarshipSelect(scholarship.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium dark:text-white">{scholarship.month} {scholarship.year}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Days: {scholarship.days} | Amount: ₹{scholarship.total_pay}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(scholarship.status)}`}>
                    {scholarship.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scholarship details and stages */}
        {selectedScholarship && (
          <div className="lg:w-1/2">
            <h4 className="font-medium mb-2 dark:text-white">Approval Status</h4>
            <div className="border rounded-md p-4 dark:border-gray-700 dark:bg-gray-800">
              {stages.length > 0 ? (
                <div className="space-y-4">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="relative">
                      {index < stages.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 -z-10"></div>
                      )}
                      <div className="flex items-start">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
                            ${stage.status === 'approved' ? 'bg-green-500' : 
                              stage.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          {stage.status === 'approved' && (
                            <span className="text-white text-xs">✓</span>
                          )}
                          {stage.status === 'rejected' && (
                            <span className="text-white text-xs">×</span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium capitalize dark:text-white">{stage.role}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            Status: {stage.status}
                          </div>
                          {stage.comment && (
                            <div className="text-sm mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded dark:text-gray-300">
                              {stage.comment}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(stage.update_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No approval stages found for this scholarship.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 