"use client";
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, DollarSign, Eye, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface RevenueTrendsProps {
  trends: any[];
}

export function RevenueTrends({ trends }: RevenueTrendsProps) {
  if (!trends || trends.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No revenue data</h3>
        <p className="text-text-secondary">Revenue trends will appear as you earn from your poems.</p>
      </Card>
    );
  }

  const maxEarnings = Math.max(...trends.map(t => t.earnings));
  const maxViews = Math.max(...trends.map(t => t.views));
  const totalEarnings = trends.reduce((sum, day) => sum + day.earnings, 0);
  const totalViews = trends.reduce((sum, day) => sum + day.views, 0);
  const poemsPublished = trends.reduce((sum, day) => sum + day.poemsPublished, 0);

  const summaryStats = [
    {
      icon: DollarSign,
      label: 'Total Period Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      color: 'text-accent',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      color: 'text-primary',
    },
    {
      icon: FileText,
      label: 'Poems Published',
      value: poemsPublished,
      color: 'text-secondary',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Earnings',
      value: `$${(totalEarnings / trends.length).toFixed(2)}`,
      color: 'text-warning',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Revenue Trends
        </h3>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Calendar size={16} />
          <span>Last {trends.length} days</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <div className={`text-lg font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-muted">
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trends Chart */}
      <div className="space-y-6">
        {/* Earnings Trend */}
        <div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-text-muted">Daily Earnings</span>
            <span className="text-text-primary font-medium">
              Peak: ${maxEarnings.toFixed(2)}
            </span>
          </div>
          <div className="flex items-end justify-between h-32 gap-1">
            {trends.map((day, index) => {
              const heightPercentage = maxEarnings > 0 ? (day.earnings / maxEarnings) * 80 : 0;
              const isPeak = day.earnings === maxEarnings;
              
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center flex-1"
                >
                  <div 
                    className={`w-full rounded-t ${
                      isPeak ? 'bg-accent' : 'bg-primary'
                    } hover:opacity-80 transition-opacity cursor-help`}
                    style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                    title={`${day.date.toLocaleDateString()}: $${day.earnings.toFixed(2)}`}
                  />
                  <div className="text-xs text-text-muted mt-1">
                    {day.date.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  {day.earnings > 0 && (
                    <div className="text-xs text-text-primary font-medium">
                      ${day.earnings.toFixed(1)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Views Trend */}
        <div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-text-muted">Daily Views</span>
            <span className="text-text-primary font-medium">
              Peak: {maxViews.toLocaleString()} views
            </span>
          </div>
          <div className="flex items-end justify-between h-24 gap-1">
            {trends.map((day, index) => {
              const heightPercentage = maxViews > 0 ? (day.views / maxViews) * 80 : 0;
              const isPeak = day.views === maxViews;
              
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  className="flex flex-col items-center flex-1"
                >
                  <div 
                    className={`w-full rounded-t ${
                      isPeak ? 'bg-secondary' : 'bg-warning'
                    } hover:opacity-80 transition-opacity cursor-help`}
                    style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                    title={`${day.date.toLocaleDateString()}: ${day.views.toLocaleString()} views`}
                  />
                  <div className="text-xs text-text-muted mt-1">
                    {day.date.getDate()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-accent mb-1">
              {((totalEarnings / totalViews) * 1000).toFixed(2)}¢
            </div>
            <div className="text-xs text-text-muted">Earnings per 1,000 Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary mb-1">
              {poemsPublished > 0 ? (totalEarnings / poemsPublished).toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-text-muted">Avg. Earnings per Poem</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-secondary mb-1">
              {trends.filter(day => day.earnings > 0).length}/{trends.length}
            </div>
            <div className="text-xs text-text-muted">Revenue Days / Total Days</div>
          </div>
        </div>

        {/* Trend Insights */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Trend Insights</h4>
          <div className="text-sm text-text-secondary space-y-1">
            <div className="flex justify-between">
              <span>Best Performing Day:</span>
              <span className="text-text-primary font-medium">
                {trends.reduce((best, day) => day.earnings > best.earnings ? day : best, trends[0]).date.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Revenue Growth:</span>
              <span className="text-green-400 font-medium">
                +{((trends[trends.length-1].earnings - trends[0].earnings) / trends[0].earnings * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Publication Impact:</span>
              <span className="text-text-primary font-medium">
                {((trends.filter(day => day.poemsPublished > 0 && day.earnings > 0).length / trends.filter(day => day.poemsPublished > 0).length) * 100).toFixed(0)}% days with publications had revenue
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}