// Dashboard logic
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
  setupEventListeners();
});

async function loadDashboard() {
  try {
    // Load statistics
    const stats = await storageManager.getStatistics();
    const progress = await storageManager.getProgress();
    
    // Update stat cards
    document.getElementById('totalProblems').textContent = stats.totalProblems || 0;
    document.getElementById('currentStreak').textContent = stats.currentStreak || 0;
    
    // Calculate total time
    const totalMinutes = Object.values(progress).reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    document.getElementById('totalTime').textContent = `${hours}h`;
    
    // Calculate this week
    const thisWeek = calculateThisWeek(stats.dailyActivity);
    document.getElementById('thisWeek').textContent = thisWeek;
    
    // Render activity chart
    renderActivityChart(stats.dailyActivity);
    
    // Render difficulty breakdown
    renderDifficultyBreakdown(progress);
    
    // Render recent problems
    renderRecentProblems(progress);
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function calculateThisWeek(dailyActivity) {
  if (!dailyActivity) return 0;
  
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  let count = 0;
  for (const [date, activity] of Object.entries(dailyActivity)) {
    const activityDate = new Date(date);
    if (activityDate >= weekAgo && activityDate <= today) {
      count += activity.problems?.length || 0;
    }
  }
  
  return count;
}

function renderActivityChart(dailyActivity) {
  const chartContainer = document.getElementById('activityChart');
  chartContainer.innerHTML = '';
  
  // Get last 14 days
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({ date: dateStr, count: 0 });
  }
  
  // Fill in actual activity
  if (dailyActivity) {
    days.forEach(day => {
      if (dailyActivity[day.date]) {
        day.count = dailyActivity[day.date].problems?.length || 0;
      }
    });
  }
  
  // Find max for scaling
  const maxCount = Math.max(...days.map(d => d.count), 1);
  
  // Render bars
  days.forEach(day => {
    const bar = document.createElement('div');
    bar.className = 'activity-day';
    if (day.count > 0) {
      bar.classList.add('has-activity');
    }
    
    const height = (day.count / maxCount) * 100;
    bar.style.height = `${Math.max(height, 10)}%`;
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'activity-tooltip';
    const date = new Date(day.date);
    tooltip.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.count} problems`;
    bar.appendChild(tooltip);
    
    chartContainer.appendChild(bar);
  });
}

function renderDifficultyBreakdown(progress) {
  const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
  
  Object.values(progress).forEach(p => {
    if (p.difficulty && difficulties.hasOwnProperty(p.difficulty)) {
      difficulties[p.difficulty]++;
    }
  });
  
  const total = Object.values(difficulties).reduce((sum, count) => sum + count, 0) || 1;
  
  // Update counts and progress bars
  document.getElementById('easyCount').textContent = difficulties.Easy;
  document.getElementById('mediumCount').textContent = difficulties.Medium;
  document.getElementById('hardCount').textContent = difficulties.Hard;
  
  document.getElementById('easyProgress').style.width = `${(difficulties.Easy / total) * 100}%`;
  document.getElementById('mediumProgress').style.width = `${(difficulties.Medium / total) * 100}%`;
  document.getElementById('hardProgress').style.width = `${(difficulties.Hard / total) * 100}%`;
}

function renderRecentProblems(progress) {
  const problemsList = document.getElementById('recentProblems');
  problemsList.innerHTML = '';
  
  // Convert to array and sort by last attempt
  const problems = Object.values(progress)
    .sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt))
    .slice(0, 5);
  
  if (problems.length === 0) {
    problemsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">No problems solved yet. Start solving to track your progress!</div>
      </div>
    `;
    return;
  }
  
  problems.forEach(problem => {
    const item = document.createElement('div');
    item.className = 'problem-item';
    
    const statusIcon = problem.status === 'solved' ? '✅' : '🔄';
    const difficultyColor = problem.difficulty === 'Easy' ? '#10b981' : 
                            problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444';
    
    item.style.borderLeftColor = difficultyColor;
    
    item.innerHTML = `
      <div class="problem-icon">${statusIcon}</div>
      <div class="problem-info">
        <div class="problem-title">${problem.problemId}</div>
        <div class="problem-meta">
          ${problem.difficulty || 'Unknown'} • 
          ${problem.attempts} attempt${problem.attempts > 1 ? 's' : ''} • 
          ${formatDate(problem.lastAttempt)}
        </div>
      </div>
    `;
    
    problemsList.appendChild(item);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function setupEventListeners() {
  document.getElementById('backToMain').addEventListener('click', () => {
    window.location.href = 'popup.html';
  });
  
  const startSolvingBtn = document.getElementById('startSolving');
  if (startSolvingBtn) {
    startSolvingBtn.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });
  }
  
  const exportDataBtn = document.getElementById('exportData');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', async () => {
      const data = await storageManager.exportData();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nakung-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
  
  const viewAllBtn = document.getElementById('viewAllProblems');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      alert('All problems view coming soon!');
    });
  }
}
