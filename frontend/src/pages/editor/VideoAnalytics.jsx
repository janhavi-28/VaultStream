import React from 'react';
import PagePlaceholder from '../../components/common/PagePlaceholder';
import { BarChart2 } from 'lucide-react';

const VideoAnalytics = () => (
  <PagePlaceholder 
    title="Analytics" 
    description="Detailed metrics on video performance, viewer engagement, and drop-off rates." 
    icon={BarChart2}
    backTo="/editor/dashboard"
    backLabel="Back to Dashboard"
  />
);

export default VideoAnalytics;
