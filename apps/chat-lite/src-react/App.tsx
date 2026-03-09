import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Chat } from './components/Chat';
import { Home } from './pages/Home';
import { SkillMarket } from './pages/SkillMarket';
import { ServicePublish } from './pages/ServicePublish';
import { ServiceManagement } from './pages/ServiceManagement';
import { RevenueStats } from './pages/RevenueStats';
import { OrderManagement } from './pages/OrderManagement';
import { ReviewManagement } from './pages/ReviewManagement';
import { TrafficAnalytics } from './pages/TrafficAnalytics';
import { ReplyTemplates } from './pages/ReplyTemplates';
import { TaskList } from './pages/TaskList';
import { TaskManagement } from './pages/TaskManagement';
import { TaskCreate } from './pages/TaskCreate';
import { TaskDetail } from './pages/TaskDetail';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/task-manage" element={<TaskManagement />} />
        <Route path="/task-create" element={<TaskCreate />} />
        <Route path="/task-detail" element={<TaskDetail />} />
        <Route path="/market" element={<SkillMarket />} />
        <Route path="/market/publish" element={<ServicePublish />} />
        <Route path="/market/manage" element={<ServiceManagement />} />
        <Route path="/market/revenue" element={<RevenueStats />} />
        <Route path="/market/orders" element={<OrderManagement />} />
        <Route path="/market/reviews" element={<ReviewManagement />} />
        <Route path="/market/analytics" element={<TrafficAnalytics />} />
        <Route path="/market/templates" element={<ReplyTemplates />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
