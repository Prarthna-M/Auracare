const Progress = require('../models/Progress');

class ProgressService {
  // Log daily progress
  async logProgress(userId, data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already logged today
    let progress = await Progress.findOne({
      user: userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (progress) {
      // Update existing entry
      Object.assign(progress, data);
      await progress.save();
      return progress;
    } else {
      // Create new entry
      const newProgress = new Progress({
        user: userId,
        ...data
      });
      await newProgress.save();
      return newProgress;
    }
  }
  
  // Get progress for last N days
  async getProgressHistory(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const history = await Progress.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    return history;
  }
  
  // Get statistics
  async getStats(userId, days = 30) {
    const history = await this.getProgressHistory(userId, days);
    
    if (history.length === 0) {
      return {
        averageSkinRating: 0,
        routineCompletionRate: 0,
        streak: 0,
        totalEntries: 0,
        commonIssues: [],
        skinTrend: 'neutral',
        progress: []
      };
    }
    
    // Calculate average skin rating
    const totalRating = history.reduce((sum, p) => sum + (p.skinRating || 5), 0);
    const averageSkinRating = totalRating / history.length;
    
    // Calculate routine completion rate
    const completedRoutines = history.filter(p => p.routineCompleted).length;
    const routineCompletionRate = (completedRoutines / history.length) * 100;
    
    // Calculate current streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = history.some(p => 
        new Date(p.date).toISOString().split('T')[0] === dateStr
      );
      
      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Get common skin issues
    const issueCount = {};
    history.forEach(p => {
      if (p.skinIssues) {
        p.skinIssues.forEach(issue => {
          issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
      }
    });
    
    const commonIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue, count]) => ({ issue, count }));
    
    // Calculate skin trend (improving, stable, declining)
    const recentRatings = history.slice(-7).map(p => p.skinRating || 5);
    if (recentRatings.length >= 3) {
      const firstWeekAvg = recentRatings.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const lastWeekAvg = recentRatings.slice(-3).reduce((a, b) => a + b, 0) / 3;
      
      let skinTrend = 'stable';
      if (lastWeekAvg > firstWeekAvg + 0.5) skinTrend = 'improving';
      if (lastWeekAvg < firstWeekAvg - 0.5) skinTrend = 'declining';
      
      return {
        averageSkinRating: Math.round(averageSkinRating * 10) / 10,
        routineCompletionRate: Math.round(routineCompletionRate),
        streak,
        totalEntries: history.length,
        commonIssues,
        skinTrend,
        progress: history.map(p => ({
          date: p.date,
          skinRating: p.skinRating,
          routineCompleted: p.routineCompleted,
          notes: p.notes
        }))
      };
    }
    
    return {
      averageSkinRating: Math.round(averageSkinRating * 10) / 10,
      routineCompletionRate: Math.round(routineCompletionRate),
      streak,
      totalEntries: history.length,
      commonIssues,
      skinTrend: 'neutral',
      progress: history.map(p => ({
        date: p.date,
        skinRating: p.skinRating,
        routineCompleted: p.routineCompleted,
        notes: p.notes
      }))
    };
  }
  
  // Add progress photo
  async addPhoto(userId, photoUrl, caption) {
    const progress = await this.logProgress(userId, {});
    progress.photos.push({ url: photoUrl, caption });
    await progress.save();
    return progress;
  }
  
  // Rate product used
  async rateProduct(userId, productId, productName, rating) {
    const progress = await this.logProgress(userId, {});
    
    const existingIndex = progress.productsUsed.findIndex(p => 
      p.productId && p.productId.toString() === productId
    );
    
    if (existingIndex >= 0) {
      progress.productsUsed[existingIndex].rating = rating;
    } else {
      progress.productsUsed.push({ productId, name: productName, rating });
    }
    
    await progress.save();
    return progress;
  }
  
  // Get product ratings
  async getProductRatings(userId) {
    const progress = await Progress.find({ user: userId });
    const productRatings = {};
    
    progress.forEach(p => {
      p.productsUsed.forEach(product => {
        if (!productRatings[product.name]) {
          productRatings[product.name] = {
            ratings: [],
            average: 0
          };
        }
        productRatings[product.name].ratings.push(product.rating);
      });
    });
    
    // Calculate averages
    for (const [name, data] of Object.entries(productRatings)) {
      const sum = data.ratings.reduce((a, b) => a + b, 0);
      data.average = sum / data.ratings.length;
      data.count = data.ratings.length;
    }
    
    return productRatings;
  }
}

module.exports = new ProgressService();