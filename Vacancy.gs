/**
 * PU College Admission Management System
 * Vacancy Management & Reporting - Vacancy.gs
 * 
 * Handles vacancy calculations, tracking, and reporting
 * for all rounds across all sections and categories.
 */

// ============================================================================
// VACANCY CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate total vacancies after a round
 * @param {number} roundNumber - Round number
 * @return {Object} Vacancy data by section and category
 */
function calculateVacancies(roundNumber) {
  try {
    Logger.log(`🔄 Calculating vacancies after Round ${roundNumber}`);
    
    const seatMatrix = getSeatMatrixConfig();
    const sections = getSectionsConfig();
    const vacancies = {};
    
    // Initialize with full seat matrix
    sections.forEach(section => {
      vacancies[section.code] = {
        government: JSON.parse(JSON.stringify(seatMatrix[section.code].government.categories)),
        management: seatMatrix[section.code].management.total,
        totalIntake: seatMatrix[section.code].totalIntake,
        filled: 0,
        vacant: seatMatrix[section.code].totalIntake
      };
    });
    
    // Subtract allotted seats from all previous rounds
    for (let round = 1; round <= roundNumber; round++) {
      const roundData = getAllotmentData(round);
      
      roundData.forEach(allotment => {
        const section = allotment.section;
        const quota = allotment.quota;
        const category = allotment.category;
        const gender = allotment.gender;
        
        if (vacancies[section]) {
          if (quota === 'Government') {
            const genderKey = gender === 'Girls' ? 'girls' : 'boys';
            if (vacancies[section].government[category] && vacancies[section].government[category][genderKey]) {
              vacancies[section].government[category][genderKey]--;
              vacancies[section].filled++;
            }
          } else if (quota === 'Management') {
            vacancies[section].management--;
            vacancies[section].filled++;
          }
        }
      });
    }
    
    // Calculate vacant seats
    sections.forEach(section => {
      vacancies[section.code].vacant = 
        vacancies[section.code].totalIntake - vacancies[section.code].filled;
    });
    
    Logger.log(`✓ Vacancy calculation complete`);
    return vacancies;
    
  } catch (error) {
    Logger.log(`✗ Error calculating vacancies: ${error}`);
    throw error;
  }
}

/**
 * Get vacancy summary for all sections
 * @param {number} roundNumber - Round number
 * @return {Object} Summary vacancy data
 */
function getVacancySummary(roundNumber) {
  try {
    const vacancies = calculateVacancies(roundNumber);
    const summary = {
      round: roundNumber,
      totalSeats: 0,
      filledSeats: 0,
      vacantSeats: 0,
      bySection: {},
      byQuota: {
        government: {
          filled: 0,
          vacant: 0
        },
        management: {
          filled: 0,
          vacant: 0
        }
      },
      byCategory: {
        GM: { filled: 0, vacant: 0 },
        SC: { filled: 0, vacant: 0 },
        ST: { filled: 0, vacant: 0 },
        CAT1: { filled: 0, vacant: 0 },
        CAT2A: { filled: 0, vacant: 0 },
        CAT2B: { filled: 0, vacant: 0 },
        CAT3A: { filled: 0, vacant: 0 },
        CAT3B: { filled: 0, vacant: 0 }
      },
      byGender: {
        girls: { filled: 0, vacant: 0 },
        boys: { filled: 0, vacant: 0 }
      }
    };
    
    // Get allotment data
    const allotmentData = getAllotmentData(roundNumber);
    
    // Process each section
    Object.keys(vacancies).forEach(sectionCode => {
      const sectionVacancy = vacancies[sectionCode];
      
      // Calculate government filled/vacant
      let govFilled = 0;
      let govVacant = 0;
      
      Object.keys(sectionVacancy.government).forEach(category => {
        const catData = sectionVacancy.government[category];
        const initialSeats = getSeatMatrixConfig()[sectionCode].government.categories[category];
        
        const girlsVacant = catData.girls || 0;
        const boysVacant = catData.boys || 0;
        
        const girlsFilled = (initialSeats.girls || 0) - girlsVacant;
        const boysFilled = (initialSeats.boys || 0) - boysVacant;
        
        govFilled += girlsFilled + boysFilled;
        govVacant += girlsVacant + boysVacant;
        
        // Category wise
        summary.byCategory[category].filled += girlsFilled + boysFilled;
        summary.byCategory[category].vacant += girlsVacant + boysVacant;
        
        // Gender wise
        summary.byGender.girls.filled += girlsFilled;
        summary.byGender.girls.vacant += girlsVacant;
        summary.byGender.boys.filled += boysFilled;
        summary.byGender.boys.vacant += boysVacant;
      });
      
      const mgmtInitial = getSeatMatrixConfig()[sectionCode].management.total;
      const mgmtFilled = mgmtInitial - sectionVacancy.management;
      
      summary.bySection[sectionCode] = {
        totalSeats: sectionVacancy.totalIntake,
        filled: sectionVacancy.filled,
        vacant: sectionVacancy.vacant,
        governmentFilled: govFilled,
        governmentVacant: govVacant,
        managementFilled: mgmtFilled,
        managementVacant: sectionVacancy.management
      };
      
      summary.totalSeats += sectionVacancy.totalIntake;
      summary.filledSeats += sectionVacancy.filled;
      summary.vacantSeats += sectionVacancy.vacant;
      
      summary.byQuota.government.filled += govFilled;
      summary.byQuota.government.vacant += govVacant;
      summary.byQuota.management.filled += mgmtFilled;
      summary.byQuota.management.vacant += sectionVacancy.management;
    });
    
    return summary;
    
  } catch (error) {
    Logger.log(`✗ Error getting vacancy summary: ${error}`);
    return { error: error.message };
  }
}

/**
 * Get vacancy details for a specific section
 * @param {string} sectionCode - Section code
 * @param {number} roundNumber - Round number
 * @return {Object} Section vacancy details
 */
function getSectionVacancy(sectionCode, roundNumber) {
  try {
    const vacancies = calculateVacancies(roundNumber);
    
    if (!vacancies[sectionCode]) {
      return { error: 'Section not found' };
    }
    
    const sectionSeats = getSeatMatrixConfig()[sectionCode];
    const sectionVacancy = vacancies[sectionCode];
    
    return {
      sectionCode: sectionCode,
      round: roundNumber,
      totalIntake: sectionSeats.totalIntake,
      filled: sectionVacancy.filled,
      vacant: sectionVacancy.vacant,
      government: {
        total: sectionSeats.government.total,
        categories: sectionVacancy.government
      },
      management: {
        total: sectionSeats.management.total,
        available: sectionVacancy.management
      },
      percentageFilled: ((sectionVacancy.filled / sectionSeats.totalIntake) * 100).toFixed(2)
    };
    
  } catch (error) {
    Logger.log(`✗ Error getting section vacancy: ${error}`);
    return { error: error.message };
  }
}

// ============================================================================
// VACANCY REPORTING FUNCTIONS
// ============================================================================

/**
 * Generate comprehensive vacancy report
 * @param {number} roundNumber - Round number
 * @return {Array} Vacancy report data
 */
function generateVacancyReport(roundNumber) {
  try {
    Logger.log(`📊 Generating vacancy report for Round ${roundNumber}`);
    
    const vacancies = calculateVacancies(roundNumber);
    const sections = getSectionsConfig();
    const reportData = [];
    
    sections.forEach(section => {
      const sectionVacancy = vacancies[section.code];
      
      // Build row data
      const row = [section.code];
      
      // Add GM seats (Girls/Boys)
      row.push(sectionVacancy.government.GM?.girls || 0);
      row.push(sectionVacancy.government.GM?.boys || 0);
      
      // Add SC seats (Girls/Boys)
      row.push(sectionVacancy.government.SC?.girls || 0);
      row.push(sectionVacancy.government.SC?.boys || 0);
      
      // Add ST seats (Girls/Boys)
      row.push(sectionVacancy.government.ST?.girls || 0);
      row.push(sectionVacancy.government.ST?.boys || 0);
      
      // Add CAT1 seats (Girls/Boys)
      row.push(sectionVacancy.government.CAT1?.girls || 0);
      row.push(sectionVacancy.government.CAT1?.boys || 0);
      
      // Add 2A seats (Girls/Boys)
      row.push(sectionVacancy.government.CAT2A?.girls || 0);
      row.push(sectionVacancy.government.CAT2A?.boys || 0);
      
      // Add 2B seats (Girls/Boys)
      row.push(sectionVacancy.government.CAT2B?.girls || 0);
      row.push(sectionVacancy.government.CAT2B?.boys || 0);
      
      // Add 3A seats (Girls/Boys)
      row.push(sectionVacancy.government.CAT3A?.girls || 0);
      row.push(sectionVacancy.government.CAT3A?.boys || 0);
      
      // Add 3B seats (Girls/Boys)
      row.push(sectionVacancy.government.CAT3B?.girls || 0);
      row.push(sectionVacancy.government.CAT3B?.boys || 0);
      
      // Add management vacancy
      row.push(sectionVacancy.management || 0);
      
      // Add round and date
      row.push(roundNumber);
      row.push(new Date());
      
      reportData.push(row);
    });
    
    Logger.log(`✓ Vacancy report generated with ${reportData.length} sections`);
    return reportData;
    
  } catch (error) {
    Logger.log(`✗ Error generating vacancy report: ${error}`);
    throw error;
  }
}

/**
 * Write vacancy report to sheet
 * @param {number} roundNumber - Round number
 */
function writeVacancyReportToSheet(roundNumber) {
  try {
    const reportData = generateVacancyReport(roundNumber);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    let sheet = ss.getSheetByName('VacancyReport');
    if (!sheet) {
      sheet = ss.insertSheet('VacancyReport');
    }
    
    // Clear existing data
    sheet.clear();
    
    // Write headers
    const headers = getVacancyReportHeaders();
    sheet.appendRow(headers);
    
    // Write data
    reportData.forEach(row => {
      sheet.appendRow(row);
    });
    
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#10b981');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    // Set column widths
    for (let i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 100);
    }
    
    Logger.log(`✓ Vacancy report written to sheet`);
    
  } catch (error) {
    Logger.log(`✗ Error writing vacancy report: ${error}`);
    throw error;
  }
}

// ============================================================================
// VACANCY ALERT & ANALYSIS
// ============================================================================

/**
 * Get critical vacancies (sections with low filled seats)
 * @param {number} roundNumber - Round number
 * @param {number} threshold - Percentage threshold (default 30%)
 * @return {Array} Critical sections
 */
function getCriticalVacancies(roundNumber, threshold = 30) {
  try {
    const summary = getVacancySummary(roundNumber);
    const critical = [];
    
    Object.keys(summary.bySection).forEach(sectionCode => {
      const section = summary.bySection[sectionCode];
      const percentageFilled = (section.filled / section.totalSeats) * 100;
      
      if (percentageFilled < threshold) {
        critical.push({
          section: sectionCode,
          totalSeats: section.totalSeats,
          filled: section.filled,
          vacant: section.vacant,
          percentageFilled: percentageFilled.toFixed(2),
          percentageVacant: (100 - percentageFilled).toFixed(2),
          severity: percentageFilled < 50 ? 'HIGH' : 'MEDIUM'
        });
      }
    });
    
    return critical.sort((a, b) => a.percentageFilled - b.percentageFilled);
    
  } catch (error) {
    Logger.log(`✗ Error getting critical vacancies: ${error}`);
    return [];
  }
}

/**
 * Get category-wise vacancy analysis
 * @param {number} roundNumber - Round number
 * @return {Object} Category vacancy analysis
 */
function getCategoryVacancyAnalysis(roundNumber) {
  try {
    const summary = getVacancySummary(roundNumber);
    const analysis = {};
    
    Object.keys(summary.byCategory).forEach(category => {
      const catData = summary.byCategory[category];
      const total = catData.filled + catData.vacant;
      
      if (total > 0) {
        analysis[category] = {
          filled: catData.filled,
          vacant: catData.vacant,
          total: total,
          percentageFilled: ((catData.filled / total) * 100).toFixed(2),
          status: catData.vacant === 0 ? 'FULL' : 'AVAILABLE'
        };
      }
    });
    
    return analysis;
    
  } catch (error) {
    Logger.log(`✗ Error getting category vacancy analysis: ${error}`);
    return {};
  }
}

/**
 * Get gender-wise vacancy analysis
 * @param {number} roundNumber - Round number
 * @return {Object} Gender vacancy analysis
 */
function getGenderVacancyAnalysis(roundNumber) {
  try {
    const summary = getVacancySummary(roundNumber);
    const analysis = {};
    
    ['girls', 'boys'].forEach(gender => {
      const data = summary.byGender[gender];
      const total = data.filled + data.vacant;
      
      analysis[gender] = {
        filled: data.filled,
        vacant: data.vacant,
        total: total,
        percentageFilled: ((data.filled / total) * 100).toFixed(2)
      };
    });
    
    return analysis;
    
  } catch (error) {
    Logger.log(`✗ Error getting gender vacancy analysis: ${error}`);
    return {};
  }
}

// ============================================================================
// VACANCY PREDICTION & FORECASTING
// ============================================================================

/**
 * Predict vacancies for next round based on current trends
 * @param {number} currentRound - Current round number
 * @return {Object} Predicted vacancies for next round
 */
function predictNextRoundVacancies(currentRound) {
  try {
    const currentSummary = getVacancySummary(currentRound);
    const previousSummary = currentRound > 1 ? getVacancySummary(currentRound - 1) : null;
    
    const prediction = {
      round: currentRound + 1,
      estimatedVacancies: currentSummary.vacantSeats,
      trend: 'STABLE'
    };
    
    if (previousSummary) {
      const vacancyTrend = currentSummary.vacantSeats - previousSummary.vacantSeats;
      
      if (vacancyTrend > 5) {
        prediction.trend = 'INCREASING';
      } else if (vacancyTrend < -5) {
        prediction.trend = 'DECREASING';
      }
      
      prediction.vacancyChange = vacancyTrend;
    }
    
    return prediction;
    
  } catch (error) {
    Logger.log(`✗ Error predicting vacancies: ${error}`);
    return { error: error.message };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get allotment data from a specific round
 * @param {number} roundNumber - Round number
 * @return {Array} Allotment data
 */
function getAllotmentData(roundNumber) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const roundSheet = ss.getSheetByName(`Round${roundNumber}`);
    
    if (!roundSheet) {
      return [];
    }
    
    const data = roundSheet.getDataRange().getValues();
    const headers = data[0];
    const headerMap = {};
    
    headers.forEach((header, index) => {
      headerMap[header] = index;
    });
    
    return data.slice(1)
      .filter(row => row[0]) // Filter empty rows
      .map(row => ({
        meritNumber: row[headerMap['Merit Number']],
        applicationNumber: row[headerMap['Application Number']],
        studentName: row[headerMap['Student Name']],
        category: row[headerMap['Category']],
        gender: row[headerMap['Gender']],
        section: row[headerMap['Section']],
        quota: row[headerMap['Quota']],
        status: row[headerMap['Status']]
      }));
    
  } catch (error) {
    Logger.log(`✗ Error getting allotment data: ${error}`);
    return [];
  }
}

Logger.log('✓ Vacancy.gs loaded successfully');
