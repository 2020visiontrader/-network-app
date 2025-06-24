// Race Condition Analysis Script
// Run this weekly to analyze race condition patterns
const fs = require('fs');
const path = require('path');

/**
 * Analyzes log files for race condition patterns
 * @param {string} logFilePath Path to the log file
 * @returns {object} Analysis report
 */
function analyzeRaceConditions(logFilePath) {
  try {
    console.log(`Analyzing log file: ${logFilePath}`);
    
    if (!fs.existsSync(logFilePath)) {
      console.error(`Log file not found: ${logFilePath}`);
      return { error: 'Log file not found' };
    }
    
    const logs = fs.readFileSync(logFilePath, 'utf8')
      .split('\n')
      .filter(line => line.includes('Race condition') || 
                       line.includes('retry') || 
                       line.includes('attempts'))
      .map(line => {
        try {
          // Extract JSON objects from log lines
          const jsonStart = line.indexOf('{');
          if (jsonStart === -1) return null;
          
          const jsonStr = line.substring(jsonStart);
          return {
            timestamp: line.substring(0, jsonStart).trim(),
            data: JSON.parse(jsonStr)
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    console.log(`Found ${logs.length} relevant log entries`);
    
    if (logs.length === 0) {
      return { error: 'No relevant log entries found' };
    }
    
    // Group operations
    const operations = {};
    logs.forEach(log => {
      const operation = log.data.operation || 'unknown';
      if (!operations[operation]) {
        operations[operation] = [];
      }
      operations[operation].push(log);
    });
    
    // Calculate metrics
    const operationStats = {};
    
    Object.keys(operations).forEach(op => {
      const opLogs = operations[op];
      const attempts = opLogs.map(log => log.data.attempts || log.data.metrics?.attempts || 1);
      const times = opLogs.map(log => log.data.timeTaken || log.data.metrics?.timeTaken || 0);
      const multipleAttempts = attempts.filter(a => a > 1).length;
      
      operationStats[op] = {
        totalCalls: opLogs.length,
        avgAttempts: attempts.reduce((sum, a) => sum + a, 0) / attempts.length,
        avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
        maxTime: Math.max(...times),
        raceConditionRate: (multipleAttempts / opLogs.length) * 100,
        recommendedSettings: {
          maxRetries: Math.ceil(Math.max(...attempts) * 1.5),
          retryDelay: Math.ceil(Math.min(2000, Math.max(500, times.sort((a, b) => a - b)[Math.floor(times.length/2)] / 2)))
        }
      };
    });
    
    // Generate summary report
    const report = {
      analyzedAt: new Date().toISOString(),
      totalLogEntries: logs.length,
      overallStats: {
        operations: Object.keys(operations).length,
        totalCalls: logs.length,
        operationsWithRaceConditions: Object.values(operationStats)
          .filter(stat => stat.raceConditionRate > 0).length
      },
      operationStats,
      recommendations: generateRecommendations(operationStats)
    };
    
    return report;
  } catch (error) {
    console.error('Error analyzing logs:', error);
    return { error: error.message };
  }
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(stats) {
  const recommendations = [];
  
  Object.entries(stats).forEach(([operation, stat]) => {
    if (stat.raceConditionRate > 20) {
      recommendations.push({
        priority: 'HIGH',
        operation,
        issue: `High race condition rate (${stat.raceConditionRate.toFixed(1)}%)`,
        suggestion: `Increase retry count to at least ${stat.recommendedSettings.maxRetries} and verify write operations more thoroughly`
      });
    } else if (stat.maxTime > 3000) {
      recommendations.push({
        priority: 'MEDIUM',
        operation,
        issue: `Slow operation (max: ${stat.maxTime}ms)`,
        suggestion: 'Consider optimizing database queries or adding indexes'
      });
    } else if (stat.raceConditionRate > 5) {
      recommendations.push({
        priority: 'LOW',
        operation,
        issue: `Occasional race conditions (${stat.raceConditionRate.toFixed(1)}%)`,
        suggestion: 'Monitor and consider increasing retry delay'
      });
    }
  });
  
  return recommendations;
}

/**
 * Save report to file
 */
function saveReport(report, outputPath) {
  const reportJson = JSON.stringify(report, null, 2);
  fs.writeFileSync(outputPath, reportJson);
  console.log(`Report saved to ${outputPath}`);
  
  // Also generate a markdown summary
  const markdownPath = outputPath.replace('.json', '.md');
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(markdownPath, markdown);
  console.log(`Markdown report saved to ${markdownPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  if (report.error) {
    return `# Race Condition Analysis - Error\n\n${report.error}`;
  }
  
  let markdown = `# Race Condition Analysis Report\n\n`;
  markdown += `**Generated:** ${report.analyzedAt}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- Total operations analyzed: ${report.overallStats.operations}\n`;
  markdown += `- Total function calls: ${report.overallStats.totalCalls}\n`;
  markdown += `- Operations with race conditions: ${report.overallStats.operationsWithRaceConditions}\n\n`;
  
  markdown += `## Operation Statistics\n\n`;
  markdown += `| Operation | Calls | Avg Attempts | Avg Time (ms) | Race Condition Rate |\n`;
  markdown += `|-----------|-------|--------------|---------------|---------------------|\n`;
  
  Object.entries(report.operationStats).forEach(([op, stat]) => {
    markdown += `| ${op} | ${stat.totalCalls} | ${stat.avgAttempts.toFixed(2)} | ${stat.avgTime.toFixed(0)} | ${stat.raceConditionRate.toFixed(1)}% |\n`;
  });
  
  if (report.recommendations.length > 0) {
    markdown += `\n## Recommendations\n\n`;
    
    report.recommendations.forEach(rec => {
      markdown += `### ${rec.priority}: ${rec.operation}\n\n`;
      markdown += `**Issue:** ${rec.issue}\n\n`;
      markdown += `**Suggestion:** ${rec.suggestion}\n\n`;
    });
  } else {
    markdown += `\n## Recommendations\n\n`;
    markdown += `No specific recommendations at this time. Performance looks good!\n\n`;
  }
  
  return markdown;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const logFilePath = args[0] || './logs/app.log';
  const outputPath = args[1] || `./reports/race-condition-report-${new Date().toISOString().split('T')[0]}.json`;
  
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('🔍 Starting race condition analysis...');
  const report = analyzeRaceConditions(logFilePath);
  saveReport(report, outputPath);
  console.log('✅ Analysis complete!');
  
  // Print key findings to console
  if (report.recommendations && report.recommendations.length > 0) {
    console.log('\n🚨 Key findings:');
    report.recommendations.forEach(rec => {
      console.log(`- ${rec.priority}: ${rec.operation} - ${rec.issue}`);
    });
  } else {
    console.log('\n✅ No significant race condition issues detected!');
  }
}

// Run the script
main();
