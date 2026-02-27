"use client";

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { ProjectModal, ProjectListView } from '@uxin/projects';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks/use-auth-token';
import { constructApiUrl } from '@/lib/api';

export default function ProjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuthToken();
  const { data: projects, isLoading } = useProjects(token);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSaveProject = (data: any) => {
    console.log("Saving project from list:", data);
    setIsModalOpen(false);
  };

  return (
    <>
      <ProjectListView 
        projects={projects || []}
        isLoading={isLoading}
        onProjectClick={(project: any) => router.push(`/projects/${project.id}`)}
        onCreateProject={() => setIsModalOpen(true)}
        token={token}
        apiBaseUrl={constructApiUrl('').toString().replace(/\/$/, '')}
      />
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProject} 
      />
    </>
  );
}
