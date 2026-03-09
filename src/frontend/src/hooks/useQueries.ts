import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  TicketFilter,
  TicketPriority,
  TicketStatus,
  TicketType,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Profile / User ──────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      department,
    }: {
      name: string;
      department: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerUser(name, department);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userPrincipal,
      newRole,
    }: {
      userPrincipal: Principal;
      newRole: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateUserRole(userPrincipal, newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ── Dashboard ───────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

// ── Tickets ─────────────────────────────────────────────────────

export function useListTickets(filter: TicketFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tickets", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTickets(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTicket(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ticket", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTicket(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketType,
      title,
      description,
      category,
      priority,
    }: {
      ticketType: TicketType;
      title: string;
      description: string;
      category: string;
      priority: TicketPriority;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTicket(
        ticketType,
        title,
        description,
        category,
        priority,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateTicketStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: bigint;
      status: TicketStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateTicketStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAssignTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      assigneeId,
    }: {
      id: bigint;
      assigneeId: Principal;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.assignTicket(id, assigneeId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      text,
    }: {
      ticketId: bigint;
      text: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(ticketId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId.toString()],
      });
    },
  });
}
