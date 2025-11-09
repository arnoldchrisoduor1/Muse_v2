"use client";
import { motion } from 'framer-motion';
import { Users, Globe, Smartphone, Monitor, Tablet, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface AudienceInsightsProps {
  demographics: any;
}

export function AudienceInsights({ demographics }: AudienceInsightsProps) {
  if (!demographics) {
    return (
      <Card className="p-8 text-center">
        <Users size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No audience data</h3>
        <p className="text-text-secondary">Audience insights will appear as your poems gain views.</p>
      </Card>
    );
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      case 'tablet': return Tablet;
      default: return Smartphone;
    }
  };

  return (
    <div className="space-y-6">
      {/* Geographic Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Globe className="text-primary" size={20} />
          Geographic Distribution
        </h3>
        
        <div className="space-y-4">
          {demographics.countries.map((country: any, index: number) => (
            <motion.div
              key={country.country}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <MapPin size={16} className="text-text-muted" />
                <span className="text-sm text-text-primary min-w-[120px]">
                  {country.country}
                </span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${country.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>
              </div>
              <div className="text-right min-w-[100px]">
                <span className="text-sm font-medium text-text-primary">
                  {country.percentage}%
                </span>
                <span className="text-xs text-text-muted ml-2">
                  ({country.viewers.toLocaleString()})
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Usage */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Smartphone className="text-secondary" size={20} />
            Device Usage
          </h3>
          
          <div className="space-y-4">
            {demographics.devices.map((device: any, index: number) => {
              const DeviceIcon = getDeviceIcon(device.device);
              
              return (
                <motion.div
                  key={device.device}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon size={20} className="text-secondary" />
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {device.device}
                      </div>
                      <div className="text-xs text-text-muted">
                        {device.viewers.toLocaleString()} viewers
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-text-primary">
                      {device.percentage}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Age Demographics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <Users className="text-accent" size={20} />
            Age Distribution
          </h3>
          
          <div className="space-y-4">
            {demographics.ageGroups.map((group: any, index: number) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-text-primary">
                  {group.group}
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${group.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className="h-2 rounded-full bg-accent"
                    />
                  </div>
                  <span className="text-sm font-medium text-text-primary w-8">
                    {group.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Peak Viewing Hours */}
      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Clock className="text-warning" size={20} />
          Peak Viewing Hours
        </h3>
        
        <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
          {Array.from({ length: 24 }, (_, hour) => {
            const peakHour = demographics.peakHours.find((ph: any) => ph.hour === hour);
            const viewers = peakHour?.viewers || 0;
            const maxViewers = Math.max(...demographics.peakHours.map((ph: any) => ph.viewers));
            const heightPercentage = maxViewers > 0 ? (viewers / maxViewers) * 100 : 0;
            
            return (
              <motion.div
                key={hour}
                initial={{ height: 0 }}
                animate={{ height: `${heightPercentage}%` }}
                transition={{ duration: 1, delay: hour * 0.05 }}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-full rounded-t ${
                    heightPercentage > 70 ? 'bg-accent' :
                    heightPercentage > 40 ? 'bg-primary' :
                    'bg-secondary'
                  }`}
                  style={{ height: `${Math.max(heightPercentage, 10)}%` }}
                />
                <div className="text-xs text-text-muted mt-1">
                  {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                </div>
                {viewers > 0 && (
                  <div className="text-xs text-text-primary font-medium">
                    {viewers}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center text-sm text-text-muted">
          Based on viewer activity across all timezones
        </div>
      </Card>

      {/* Audience Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Audience Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">
              {demographics.countries.length}
            </div>
            <div className="text-xs text-text-muted">Countries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary mb-1">
              {demographics.devices.reduce((sum: number, device: any) => sum + device.viewers, 0).toLocaleString()}
            </div>
            <div className="text-xs text-text-muted">Total Viewers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent mb-1">
              {Math.max(...demographics.peakHours.map((ph: any) => ph.viewers)).toLocaleString()}
            </div>
            <div className="text-xs text-text-muted">Peak Hourly Viewers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning mb-1">
              {demographics.ageGroups[0].percentage}%
            </div>
            <div className="text-xs text-text-muted">Largest Age Group</div>
          </div>
        </div>
      </Card>
    </div>
  );
}