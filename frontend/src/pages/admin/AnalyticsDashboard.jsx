import React from 'react';
import { Activity, AlertTriangle, BarChart3, Database, Users } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import StatCard from '../../components/admin/StatCard';
import SimpleBarChart from '../../components/admin/SimpleBarChart';
import SimpleLineChart from '../../components/admin/SimpleLineChart';
import ActivityFeedCard from '../../components/admin/ActivityFeedCard';
import { activityFeed, analyticsCards, storageByTenant, uploadsTrend, userActivitySeries } from '../../data/adminMockData';

const icons = {
  'uploads-day': BarChart3,
  'user-activity': Users,
  streams: Activity,
  flagged: AlertTriangle,
};

const AnalyticsDashboard = () => (
  <AdminShell
    badge="Analytics"
    title="Platform analytics"
    description="Track uploads per day, storage usage, active streams, user activity, and flagged-content ratios from one admin reporting surface."
  >
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {analyticsCards.map((card) => (
        <StatCard key={card.id} icon={icons[card.id]} label={card.label} value={card.value} change={card.delta} tone={card.tone} />
      ))}
    </section>
    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <SimpleBarChart title="Uploads per day" subtitle="Weekly upload throughput across tenants." data={uploadsTrend} color="bg-sky-500" />
      <SimpleBarChart title="Storage usage by tenant" subtitle="Relative footprint of active organizations." data={storageByTenant} color="bg-emerald-500" />
    </section>
    <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <SimpleLineChart title="User activity" subtitle="Hourly active-user volume for the current day." data={userActivitySeries} />
      <ActivityFeedCard items={activityFeed} />
    </section>
  </AdminShell>
);

export default AnalyticsDashboard;
