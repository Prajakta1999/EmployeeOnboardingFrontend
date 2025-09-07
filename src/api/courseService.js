import http from '@/api/http';

// =============================================
// COURSE ENDPOINTS
// =============================================

// --- Instructor Course Methods ---
export const createCourse = (courseData) => {
  return http.post('/courses', courseData);
};

export const getInstructorCourses = () => {
  return http.get('/courses/instructor/my-courses');
};

export const getInstructorCourseById = (courseId) => {
    return http.get(`/courses/instructor/${courseId}`);
};

export const updateCourse = (courseId, courseData) => {
  return http.put(`/courses/${courseId}`, courseData);
};

export const deleteCourse = (courseId) => {
  return http.delete(`/courses/${courseId}`);
};


// --- Student Course Methods ---
export const getAvailableCourses = () => {
  return http.get('/courses/available');
};

export const getEnrolledCourses = () => {
  return http.get('/courses/student/enrolled');
};

export const enrollInCourse = (courseId) => {
  return http.post(`/courses/${courseId}/enroll`);
};


// =============================================
// MODULE ENDPOINTS
// =============================================

// --- Instructor Module Methods ---
export const createModule = (moduleData) => {
    return http.post('/modules', moduleData);
};

export const getInstructorModules = (courseId = null) => {
    const params = courseId ? { courseId } : {};
    return http.get('/modules/instructor/my-modules', { params });
};

export const getInstructorModuleById = (moduleId) => {
    return http.get(`/modules/instructor/${moduleId}`);
};

export const updateModule = (moduleId, moduleData) => {
    return http.put(`/modules/${moduleId}`, moduleData);
};

export const publishModule = (moduleId) => {
    return http.patch(`/modules/${moduleId}/publish`);
};

export const unpublishModule = (moduleId) => {
    return http.patch(`/modules/${moduleId}/unpublish`);
};

export const deleteModule = (moduleId) => {
    return http.delete(`/modules/${moduleId}`);
};


// --- Student Module Methods ---
export const getStudentModules = (courseId) => {
    // Assuming students see modules within a course context
    // The backend endpoint GET /student/available can be filtered, but let's simplify for now.
    return http.get(`/modules/student/available?courseId=${courseId}`);
};

export const getStudentModuleById = (moduleId) => {
    return http.get(`/modules/student/${moduleId}`);
};