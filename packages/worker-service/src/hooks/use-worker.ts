import { useState, useEffect } from "react";
import { WorkerProfile, WorkerService } from "../types";

export function useWorkerProfile(userId?: string) {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/workers/profile/${userId}`);
        const result = await response.json();

        if (result.success) {
          setProfile(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export function useWorkerServices(workerId?: string) {
  const [services, setServices] = useState<WorkerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workerId) return;

    async function fetchServices() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/workers/${workerId}/services`);
        const result = await response.json();

        if (result.success) {
          setServices(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch services");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [workerId]);

  return { services, loading, error };
}
