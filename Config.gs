/**
 * PU College Admission Management System
 * Configuration Management - Config.gs
 * 
 * Centralized configuration for seat matrix, categories, sections,
 * and system-wide settings.
 */

// ============================================================================
// SEAT MATRIX CONFIGURATION
// ============================================================================

/**
 * Get complete seat matrix for all sections
 * @return {Object} Seat matrix with all sections and quotas
 */
function getSeatMatrixConfig() {
  return {
    PCMB1: getSectionSeatMatrix(),
    PCMB2: getSectionSeatMatrix(),
    PCMC1: getSectionSeatMatrix(),
    PCMC2: getSectionSeatMatrix(),
    PCMC3: getSectionSeatMatrix(),
    CEBA1: getSectionSeatMatrix(),
    CEBA2: getSectionSeatMatrix(),
    SEBA1: getSectionSeatMatrix(),
    MSBA1: getSectionSeatMatrix(),
    HEPP1: getSectionSeatMatrix()
  };
}

/**
 * Get seat matrix for a single section
 * @return {Object} Section seat breakdown
 */
function getSectionSeatMatrix() {
  return {
    totalIntake: 80,
    government: {
      total: 40,
      girls: 20,
      boys: 20,
      categories: {
        GM: { girls: 9, boys: 9 },
        SC: { girls: 3, boys: 3 },
        ST: { girls: 1, boys: 1 },
        CAT1: { girls: 1, boys: 1 },
        CAT2A: { girls: 3, boys: 3 },
        CAT2B: { girls: 1, boys: 1 },
        CAT3A: { girls: 1, boys: 1 },
        CAT3B: { girls: 1, boys: 1 }
      }
    },
    management: {
      total: 40,
      girls: 20,
      boys: 20,
      categories: {
        MERIT: { girls: 20, boys: 20 }
      }
    }
  };
}

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

/**
 * Get all categories with display names
 * @return {Object} Categories mapping
 */
function getCategoriesConfig() {
  return {
    GM: {
      code: 'GM',
      name: 'General Merit',
      reservation: false,
      priority: 1
    },
    SC: {
      code: 'SC',
      name: 'Scheduled Caste',
      reservation: true,
      priority: 2
    },
    ST: {
      code: 'ST',
      name: 'Scheduled Tribe',
      reservation: true,
      priority: 3
    },
    CAT1: {
      code: 'CAT1',
      name: 'Category 1',
      reservation: true,
      priority: 4
    },
    CAT2A: {
      code: '2A',
      name: 'Other Backward Class - 2A',
      reservation: true,
      priority: 5
    },
    CAT2B: {
      code: '2B',
      name: 'Other Backward Class - 2B',
      reservation: true,
      priority: 6
    },
    CAT3A: {
      code: '3A',
      name: 'Other Backward Class - 3A',
      reservation: true,
      priority: 7
    },
    CAT3B: {
      code: '3B',
      name: 'Other Backward Class - 3B',
      reservation: true,
      priority: 8
    }
  };
}

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

/**
 * Get all sections
 * @return {Array} Array of section names
 */
function getSectionsConfig() {
  return [
    { code: 'PCMB1', name: 'PCMB - Section 1', capacity: 80 },
    { code: 'PCMB2', name: 'PCMB - Section 2', capacity: 80 },
    { code: 'PCMC1', name: 'PCMC - Section 1', capacity: 80 },
    { code: 'PCMC2', name: 'PCMC - Section 2', capacity: 80 },
    { code: 'PCMC3', name: 'PCMC - Section 3', capacity: 80 },
    { code: 'CEBA1', name: 'CEBA - Section 1', capacity: 80 },
    { code: 'CEBA2', name: 'CEBA - Section 2', capacity: 80 },
    { code: 'SEBA1', name: 'SEBA - Section 1', capacity: 80 },
    { code: 'MSBA1', name: 'MSBA - Section 1', capacity: 80 },
    { code: 'HEPP1', name: 'HEPP - Section 1', capacity: 80 }
  ];
}

// ============================================================================
// SHEET NAMES CONFIGURATION
// ============================================================================

/**
 * Get all sheet names used in the system
 * @return {Object} Sheet names mapping
 */
function getSheetNamesConfig() {
  return {
    DASHBOARD: 'Dashboard',
    STUDENTS: 'Students',
    SEAT_MATRIX: 'SeatMatrix',
    MERIT_LIST: 'MeritList',
    ROUND1: 'Round1',
    ROUND2: 'Round2',
    ROUND3: 'Round3',
    VACANCY: 'VacancyReport',
    FINAL_ADMISSIONS: 'FinalAdmissions',
    SETTINGS: 'Settings',
    LOGS: 'Logs',
    WAITING_LIST: 'WaitingList',
    REJECTED: 'Rejected'
  };
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Get validation rules for student registration
 * @return {Object} Validation rules
 */
function getValidationRules() {
  return {
    applicationNumber: {
      required: true,
      unique: true,
      pattern: /^[A-Z0-9]{6,10}$/,
      message: 'Application Number must be 6-10 alphanumeric characters'
    },
    studentName: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name should contain only letters and spaces'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    },
    mobile: {
      required: true,
      pattern: /^[0-9]{10}$/,
      message: 'Mobile number must be 10 digits'
    },
    totalMarks: {
      required: true,
      minValue: 0,
      maxValue: 600,
      message: 'Total marks should be between 0 and 600'
    },
    percentage: {
      required: true,
      minValue: 0,
      maxValue: 100,
      message: 'Percentage should be between 0 and 100'
    },
    category: {
      required: true,
      allowedValues: ['GM', 'SC', 'ST', 'CAT1', '2A', '2B', '3A', '3B'],
      message: 'Invalid category selected'
    },
    gender: {
      required: true,
      allowedValues: ['Boys', 'Girls'],
      message: 'Gender must be Boys or Girls'
    }
  };
}

// ============================================================================
// STUDENT REGISTRATION COLUMNS
// ============================================================================

/**
 * Get student registration sheet headers
 * @return {Array} Column headers for students sheet
 */
function getStudentHeaders() {
  return [
    'Application Number',
    'Student Name',
    'Father Name',
    'Mother Name',
    'Gender',
    'Category',
    'Mobile',
    'Email',
    'SSLC Register Number',
    'Total Marks',
    'Percentage',
    'Rural',
    'Kannada Medium',
    'Special Category',
    'Choice1',
    'Choice2',
    'Choice3',
    'Choice4',
    'Choice5',
    'Registration Date'
  ];
}

/**
 * Get merit list sheet headers
 * @return {Array} Column headers for merit list sheet
 */
function getMeritListHeaders() {
  return [
    'Merit Number',
    'Application Number',
    'Student Name',
    'Total Marks',
    'Percentage',
    'Category',
    'Gender',
    'Email',
    'Mobile',
    'Choices'
  ];
}

/**
 * Get allotment sheet headers
 * @return {Array} Column headers for allotment sheets
 */
function getAllotmentHeaders() {
  return [
    'Merit Number',
    'Application Number',
    'Student Name',
    'Category',
    'Gender',
    'Section',
    'Quota',
    'Status',
    'Allotment Date',
    'Choices Matched'
  ];
}

/**
 * Get final admissions sheet headers
 * @return {Array} Column headers for final admissions sheet
 */
function getFinalAdmissionHeaders() {
  return [
    'Merit Number',
    'Application Number',
    'Student Name',
    'Total Marks',
    'Percentage',
    'Category',
    'Gender',
    'Quota',
    'Section',
    'Round',
    'Admission Status',
    'Admission Date',
    'Email',
    'Mobile'
  ];
}

/**
 * Get vacancy report headers
 * @return {Array} Column headers for vacancy report
 */
function getVacancyReportHeaders() {
  return [
    'Section',
    'GM Girls',
    'GM Boys',
    'SC Girls',
    'SC Boys',
    'ST Girls',
    'ST Boys',
    'CAT1 Girls',
    'CAT1 Boys',
    '2A Girls',
    '2A Boys',
    '2B Girls',
    '2B Boys',
    '3A Girls',
    '3A Boys',
    '3B Girls',
    '3B Boys',
    'Management Vacancy',
    'Round Number',
    'Generated Date'
  ];
}

// ============================================================================
// SYSTEM CONSTANTS
// ============================================================================

/**
 * Get system-wide constants
 * @return {Object} System constants
 */
function getSystemConstants() {
  return {
    // Seat counts
    TOTAL_INTAKE_PER_SECTION: 80,
    GOVERNMENT_SEATS: 40,
    MANAGEMENT_SEATS: 40,
    
    // Gender splits
    GIRLS_SEATS: 40,
    BOYS_SEATS: 40,
    
    // Maximum choices
    MAX_CHOICES: 5,
    
    // Rounds
    TOTAL_ROUNDS: 3,
    
    // Status values
    STATUS: {
      REGISTERED: 'Registered',
      MERIT_GENERATED: 'Merit Generated',
      ALLOTTED: 'Allotted',
      ADMITTED: 'Admitted',
      REJECTED: 'Rejected',
      WAITING_LIST: 'Waiting List',
      CANCELLED: 'Cancelled'
    },
    
    // Quota types
    QUOTA: {
      GOVERNMENT: 'Government',
      MANAGEMENT: 'Management'
    },
    
    // Reservation types
    RESERVATION: {
      GIRLS: 'Girls',
      BOYS: 'Boys',
      CATEGORY: 'Category'
    },
    
    // Maximum execution time in seconds
    MAX_EXECUTION_TIME: 300
  };
}

// ============================================================================
// PREFERENCE CHOICE CONFIGURATION
// ============================================================================

/**
 * Get valid choices for student preferences
 * @return {Array} Available choices
 */
function getAvailableChoices() {
  return getSectionsConfig().map(section => section.code);
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Get email template configuration
 * @return {Object} Email templates
 */
function getEmailTemplates() {
  return {
    REGISTRATION_CONFIRMATION: {
      subject: 'PU Admission - Registration Confirmation',
      body: 'Dear {studentName},\n\nYour registration has been successfully submitted.\n\nApplication Number: {appNumber}\n\nThank you.'
    },
    MERIT_ANNOUNCEMENT: {
      subject: 'PU Admission - Merit List Announced',
      body: 'Dear {studentName},\n\nMerit list has been announced. Your merit number is {meritNumber}.\n\nPlease log in to the student portal for details.'
    },
    ALLOTMENT_NOTIFICATION: {
      subject: 'PU Admission - Seat Allotted',
      body: 'Dear {studentName},\n\nCongratulations! You have been allotted a seat in {section}.\n\nSection: {section}\nQuota: {quota}\n\nPlease complete your admission formalities.'
    },
    REJECTION_NOTIFICATION: {
      subject: 'PU Admission - Application Status',
      body: 'Dear {studentName},\n\nUnfortunately, you have not been selected in this round.\n\nYou are on the waiting list. Thank you.'
    }
  };
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

/**
 * Get system settings
 * @return {Object} System settings
 */
function getSystemSettings() {
  return {
    // College details
    COLLEGE_NAME: 'PU College Admission System',
    COLLEGE_CODE: 'PU-KA',
    
    // System settings
    ENABLE_EMAIL_NOTIFICATIONS: true,
    ENABLE_SMS_NOTIFICATIONS: false,
    ENABLE_WAITING_LIST: true,
    AUTO_GENERATE_REPORT: true,
    
    // Pagination
    ROWS_PER_PAGE: 50,
    
    // Currency
    CURRENCY: 'INR',
    
    // Date format
    DATE_FORMAT: 'DD-MM-YYYY',
    TIME_FORMAT: 'HH:mm:ss',
    
    // Timezone
    TIMEZONE: 'Asia/Kolkata',
    
    // Backup settings
    AUTO_BACKUP: true,
    BACKUP_FREQUENCY: 'DAILY',
    
    // Logging
    ENABLE_DETAILED_LOGGING: true,
    LOG_RETENTION_DAYS: 90
  };
}

// ============================================================================
// CATEGORY RESERVATION MATRIX
// ============================================================================

/**
 * Get category-wise reservation breakdown
 * @return {Object} Category reservation details
 */
function getCategoryReservationMatrix() {
  return {
    GM: {
      name: 'General Merit',
      reserved: false,
      girls: 9,
      boys: 9
    },
    SC: {
      name: 'Scheduled Caste',
      reserved: true,
      girls: 3,
      boys: 3
    },
    ST: {
      name: 'Scheduled Tribe',
      reserved: true,
      girls: 1,
      boys: 1
    },
    CAT1: {
      name: 'Category 1',
      reserved: true,
      girls: 1,
      boys: 1
    },
    CAT2A: {
      name: 'OBC 2A',
      reserved: true,
      girls: 3,
      boys: 3
    },
    CAT2B: {
      name: 'OBC 2B',
      reserved: true,
      girls: 1,
      boys: 1
    },
    CAT3A: {
      name: 'OBC 3A',
      reserved: true,
      girls: 1,
      boys: 1
    },
    CAT3B: {
      name: 'OBC 3B',
      reserved: true,
      girls: 1,
      boys: 1
    }
  };
}

// ============================================================================
// ROUND CONFIGURATION
// ============================================================================

/**
 * Get round configuration
 * @return {Object} Round details
 */
function getRoundConfiguration() {
  return {
    1: {
      name: 'Round 1',
      description: 'Initial allotment based on merit and choice preferences',
      seatType: ['GOVERNMENT', 'MANAGEMENT'],
      allowedStatus: ['MERIT_GENERATED']
    },
    2: {
      name: 'Round 2',
      description: 'Allotment for remaining candidates from vacancies',
      seatType: ['GOVERNMENT', 'MANAGEMENT'],
      allowedStatus: ['MERIT_GENERATED', 'REJECTED']
    },
    3: {
      name: 'Round 3 (Final)',
      description: 'Final allotment of remaining vacancies',
      seatType: ['GOVERNMENT', 'MANAGEMENT'],
      allowedStatus: ['MERIT_GENERATED', 'REJECTED', 'WAITING_LIST']
    }
  };
}

Logger.log('✓ Config.gs loaded successfully');
