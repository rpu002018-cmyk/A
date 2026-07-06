/**
 * PU College Admission Management System
 * Seat Allotment Engine - Allotment.gs
 * 
 * Handles all seat allotment logic including:
 * - Government seat allocation with reservations
 * - Management seat allocation
 * - Choice-based preference matching
 * - Waiting list management
 */

// ============================================================================
// MAIN ALLOTMENT FUNCTIONS
// ============================================================================

/**
 * Process allotment for a specific round
 * @param {number} roundNumber - Round number (1, 2, or 3)
 * @return {Object} Allotment result
 */
function processAllotmentRound(roundNumber) {
  try {
    Logger.log(`🔄 Starting allotment for Round ${roundNumber}`);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get merit list
    const meritSheet = ss.getSheetByName('MeritList');
    if (!meritSheet) throw new Error('Merit List sheet not found');
    
    const meritData = meritSheet.getDataRange().getValues();
    const meritList = parseAllotmentData(meritData);
    
    // Get seat matrix
    const seatMatrix = getSeatMatrixConfig();
    
    // Initialize allotment result
    const allotmentResult = {
      round: roundNumber,
      allotted: [],
      rejected: [],
      waitingList: [],
      statistics: {
        governmentAllotted: 0,
        managementAllotted: 0,
        totalAllotted: 0
      }
    };
    
    // Process each section
    const sections = getSectionsConfig();
    
    for (const section of sections) {
      const sectionAllotment = processSection(
        section.code,
        meritList,
        seatMatrix[section.code],
        roundNumber
      );
      
      allotmentResult.allotted = allotmentResult.allotted.concat(sectionAllotment.allotted);
      allotmentResult.rejected = allotmentResult.rejected.concat(sectionAllotment.rejected);
      allotmentResult.waitingList = allotmentResult.waitingList.concat(sectionAllotment.waitingList);
      
      allotmentResult.statistics.governmentAllotted += sectionAllotment.governmentAllotted;
      allotmentResult.statistics.managementAllotted += sectionAllotment.managementAllotted;
    }
    
    allotmentResult.statistics.totalAllotted = 
      allotmentResult.statistics.governmentAllotted + 
      allotmentResult.statistics.managementAllotted;
    
    // Write results to sheets
    writeAllotmentResults(allotmentResult, roundNumber);
    
    Logger.log(`✓ Round ${roundNumber} allotment complete`);
    Logger.log(`  - Government Allotted: ${allotmentResult.statistics.governmentAllotted}`);
    Logger.log(`  - Management Allotted: ${allotmentResult.statistics.managementAllotted}`);
    Logger.log(`  - Waiting List: ${allotmentResult.waitingList.length}`);
    
    return allotmentResult;
    
  } catch (error) {
    Logger.log(`✗ Error in processAllotmentRound: ${error}`);
    throw error;
  }
}

// ============================================================================
// SECTION-LEVEL ALLOTMENT
// ============================================================================

/**
 * Process allotment for a single section
 * @param {string} sectionCode - Section code (e.g., 'PCMB1')
 * @param {Array} meritList - Merit list data
 * @param {Object} sectionSeats - Seat configuration for section
 * @param {number} roundNumber - Round number
 * @return {Object} Section allotment result
 */
function processSection(sectionCode, meritList, sectionSeats, roundNumber) {
  try {
    const result = {
      allotted: [],
      rejected: [],
      waitingList: [],
      governmentAllotted: 0,
      managementAllotted: 0
    };
    
    // Initialize seat tracking
    const seatTracker = initializeSeatTracker(sectionSeats);
    
    // Step 1: Allocate Government Seats
    Logger.log(`  Processing Government Seats for ${sectionCode}`);
    
    // 1a. Process Girls Reservation
    const girlsResult = allocateReservedSeats(
      meritList,
      sectionCode,
      'Girls',
      sectionSeats.government.categories,
      seatTracker
    );
    result.allotted = result.allotted.concat(girlsResult.allotted);
    result.rejected = result.rejected.concat(girlsResult.rejected);
    result.governmentAllotted += girlsResult.allotted.length;
    
    // 1b. Process Boys Reservation
    const boysResult = allocateReservedSeats(
      meritList,
      sectionCode,
      'Boys',
      sectionSeats.government.categories,
      seatTracker
    );
    result.allotted = result.allotted.concat(boysResult.allotted);
    result.rejected = result.rejected.concat(boysResult.rejected);
    result.governmentAllotted += boysResult.allotted.length;
    
    // Step 2: Allocate Management Seats
    Logger.log(`  Processing Management Seats for ${sectionCode}`);
    
    const mgmtResult = allocateManagementSeats(
      meritList,
      sectionCode,
      sectionSeats.management,
      seatTracker
    );
    result.allotted = result.allotted.concat(mgmtResult.allotted);
    result.rejected = result.rejected.concat(mgmtResult.rejected);
    result.waitingList = result.waitingList.concat(mgmtResult.waitingList);
    result.managementAllotted += mgmtResult.allotted.length;
    
    return result;
    
  } catch (error) {
    Logger.log(`✗ Error in processSection: ${error}`);
    throw error;
  }
}

/**
 * Initialize seat tracker for a section
 * @param {Object} sectionSeats - Seat configuration
 * @return {Object} Seat tracker
 */
function initializeSeatTracker(sectionSeats) {
  const tracker = {
    government: {},
    management: {
      available: sectionSeats.management.total,
      allocated: 0
    }
  };
  
  // Initialize government seats by category and gender
  Object.keys(sectionSeats.government.categories).forEach(category => {
    tracker.government[category] = {
      girls: {
        total: sectionSeats.government.categories[category].girls,
        available: sectionSeats.government.categories[category].girls,
        allocated: 0
      },
      boys: {
        total: sectionSeats.government.categories[category].boys,
        available: sectionSeats.government.categories[category].boys,
        allocated: 0
      }
    };
  });
  
  return tracker;
}

// ============================================================================
// GOVERNMENT SEAT ALLOCATION
// ============================================================================

/**
 * Allocate reserved government seats
 * @param {Array} meritList - Merit list
 * @param {string} sectionCode - Section code
 * @param {string} gender - Gender ('Girls' or 'Boys')
 * @param {Object} categorySeats - Category seat configuration
 * @param {Object} seatTracker - Seat tracker
 * @return {Object} Allocation result
 */
function allocateReservedSeats(meritList, sectionCode, gender, categorySeats, seatTracker) {
  const result = {
    allotted: [],
    rejected: []
  };
  
  // Get students of this gender from merit list
  const filteredStudents = meritList.filter(
    student => student.gender === gender
  );
  
  Logger.log(`    ${gender} - Processing ${filteredStudents.length} students`);
  
  // Process each category in priority order
  const categoryPriority = ['SC', 'ST', 'CAT1', '2A', '2B', '3A', '3B', 'GM'];
  
  for (const category of categoryPriority) {
    if (!categorySeats[category]) continue;
    
    // Get students of this category
    const categoryStudents = filteredStudents.filter(
      student => student.category === category && !student.allotted
    );
    
    Logger.log(`      ${category}: ${categoryStudents.length} students, Seats: ${seatTracker.government[category][gender.toLowerCase()].available}`);
    
    // Process each student
    for (const student of categoryStudents) {
      if (seatTracker.government[category][gender.toLowerCase()].available > 0) {
        
        // Check if student's preference matches section
        if (student.choiceOrder && student.choiceOrder.includes(sectionCode)) {
          
          // Allocate seat
          const allotment = {
            meritNumber: student.meritNumber,
            applicationNumber: student.applicationNumber,
            studentName: student.studentName,
            category: category,
            gender: gender,
            section: sectionCode,
            quota: 'Government',
            categoryReservation: category,
            allotmentDate: new Date(),
            status: 'Allotted',
            choiceMatched: sectionCode,
            round: 1
          };
          
          result.allotted.push(allotment);
          seatTracker.government[category][gender.toLowerCase()].available--;
          seatTracker.government[category][gender.toLowerCase()].allocated++;
          student.allotted = true;
          
          Logger.log(`        ✓ Allocated ${student.studentName} to ${sectionCode}`);
        }
      }
    }
  }
  
  return result;
}

/**
 * Allocate management seats (pure merit basis)
 * @param {Array} meritList - Merit list
 * @param {string} sectionCode - Section code
 * @param {Object} mgmtSeats - Management seat configuration
 * @param {Object} seatTracker - Seat tracker
 * @return {Object} Allocation result
 */
function allocateManagementSeats(meritList, sectionCode, mgmtSeats, seatTracker) {
  const result = {
    allotted: [],
    rejected: [],
    waitingList: []
  };
  
  // Get unallotted students sorted by merit
  const unallottedStudents = meritList
    .filter(student => !student.allotted)
    .sort((a, b) => b.marks - a.marks);
  
  Logger.log(`    Management: Processing ${unallottedStudents.length} students, Seats: ${seatTracker.management.available}`);
  
  // Allocate based on preference
  for (const student of unallottedStudents) {
    if (seatTracker.management.available > 0) {
      
      if (student.choiceOrder && student.choiceOrder.includes(sectionCode)) {
        // Allocate seat
        const allotment = {
          meritNumber: student.meritNumber,
          applicationNumber: student.applicationNumber,
          studentName: student.studentName,
          category: student.category,
          gender: student.gender,
          section: sectionCode,
          quota: 'Management',
          allotmentDate: new Date(),
          status: 'Allotted',
          choiceMatched: sectionCode,
          round: 1
        };
        
        result.allotted.push(allotment);
        seatTracker.management.available--;
        seatTracker.management.allocated++;
        student.allotted = true;
        
        Logger.log(`      ✓ Allocated ${student.studentName} to ${sectionCode} (Management)`);
      }
    } else {
      // Add to waiting list
      result.waitingList.push({
        meritNumber: student.meritNumber,
        applicationNumber: student.applicationNumber,
        studentName: student.studentName,
        category: student.category,
        gender: student.gender,
        preferredSection: student.choiceOrder ? student.choiceOrder[0] : sectionCode,
        status: 'Waiting List'
      });
    }
  }
  
  return result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse allotment data from sheet
 * @param {Array} data - Raw data from sheet
 * @return {Array} Parsed merit list
 */
function parseAllotmentData(data) {
  const headers = data[0];
  const headerMap = {};
  
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });
  
  return data.slice(1)
    .filter(row => row[headerMap['Merit Number']])
    .map((row, index) => {
      const choicesStr = row[headerMap['Choices']] || '';
      const choices = choicesStr.split('→').map(c => c.trim()).filter(c => c);
      
      return {
        meritNumber: row[headerMap['Merit Number']],
        applicationNumber: row[headerMap['Application Number']],
        studentName: row[headerMap['Student Name']],
        marks: parseFloat(row[headerMap['Total Marks']]) || 0,
        percentage: parseFloat(row[headerMap['Percentage']]) || 0,
        category: row[headerMap['Category']] || 'GM',
        gender: row[headerMap['Gender']] || '',
        email: row[headerMap['Email']] || '',
        mobile: row[headerMap['Mobile']] || '',
        choiceOrder: choices,
        allotted: false
      };
    });
}

/**
 * Write allotment results to sheets
 * @param {Object} result - Allotment result
 * @param {number} roundNumber - Round number
 */
function writeAllotmentResults(result, roundNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = `Round${roundNumber}`;
  
  // Get or create sheet
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Clear existing data
  sheet.clear();
  
  // Write headers
  const headers = getAllotmentHeaders();
  sheet.appendRow(headers);
  
  // Write allotted students
  result.allotted.forEach(student => {
    sheet.appendRow([
      student.meritNumber,
      student.applicationNumber,
      student.studentName,
      student.category,
      student.gender,
      student.section,
      student.quota,
      student.status,
      student.allotmentDate,
      student.choiceMatched
    ]);
  });
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2563eb');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(1, 80);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 120);
  
  Logger.log(`✓ Wrote ${result.allotted.length} allotments to ${sheetName}`);
}

/**
 * Calculate seat availability for a round
 * @param {number} roundNumber - Round number
 * @return {Object} Available seats by section and category
 */
function calculateAvailableSeats(roundNumber) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const seatMatrix = getSeatMatrixConfig();
    const sections = getSectionsConfig();
    
    // Initialize available seats
    const available = {};
    
    sections.forEach(section => {
      available[section.code] = JSON.parse(JSON.stringify(seatMatrix[section.code]));
    });
    
    // Subtract already allotted seats from previous rounds
    for (let round = 1; round < roundNumber; round++) {
      const roundSheet = ss.getSheetByName(`Round${round}`);
      if (!roundSheet) continue;
      
      const data = roundSheet.getDataRange().getValues();
      
      // Skip header
      for (let i = 1; i < data.length; i++) {
        const section = data[i][5]; // Section column
        const quota = data[i][6]; // Quota column
        const category = data[i][3]; // Category column
        const gender = data[i][4]; // Gender column
        
        if (available[section]) {
          if (quota === 'Government' && available[section].government.categories[category]) {
            const genderKey = gender.toLowerCase();
            available[section].government.categories[category][genderKey]--;
          } else if (quota === 'Management') {
            available[section].management.total--;
          }
        }
      }
    }
    
    return available;
  } catch (error) {
    Logger.log(`✗ Error calculating available seats: ${error}`);
    return {};
  }
}

/**
 * Check if a student is eligible for a specific category seat
 * @param {Object} student - Student data
 * @param {string} category - Category code
 * @return {boolean} Eligibility status
 */
function isEligibleForCategory(student, category) {
  // Student must be in that category or higher priority
  const categories = ['GM', 'SC', 'ST', 'CAT1', '2A', '2B', '3A', '3B'];
  const studentPriority = categories.indexOf(student.category);
  const categoryPriority = categories.indexOf(category);
  
  return studentPriority <= categoryPriority;
}

/**
 * Get allotment report for a round
 * @param {number} roundNumber - Round number
 * @return {Object} Allotment statistics
 */
function getAllotmentReport(roundNumber) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const roundSheet = ss.getSheetByName(`Round${roundNumber}`);
    
    if (!roundSheet) {
      return { error: 'Round sheet not found' };
    }
    
    const data = roundSheet.getDataRange().getValues();
    const stats = {
      totalAllotted: 0,
      governmentAllotted: 0,
      managementAllotted: 0,
      girlsAllotted: 0,
      boysAllotted: 0,
      byCategory: {},
      bySection: {}
    };
    
    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
      const category = data[i][3];
      const gender = data[i][4];
      const section = data[i][5];
      const quota = data[i][6];
      
      stats.totalAllotted++;
      
      if (quota === 'Government') {
        stats.governmentAllotted++;
      } else {
        stats.managementAllotted++;
      }
      
      if (gender === 'Girls') {
        stats.girlsAllotted++;
      } else {
        stats.boysAllotted++;
      }
      
      // Category wise
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = 0;
      }
      stats.byCategory[category]++;
      
      // Section wise
      if (!stats.bySection[section]) {
        stats.bySection[section] = 0;
      }
      stats.bySection[section]++;
    }
    
    return stats;
  } catch (error) {
    Logger.log(`✗ Error getting allotment report: ${error}`);
    return { error: error.message };
  }
}

Logger.log('✓ Allotment.gs loaded successfully');
