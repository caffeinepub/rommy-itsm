import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssetFilter,
  AssetStatus,
  AssetType,
  ChangeFilter,
  ChangeStatus,
  ChangeType,
  ImpactLevel,
  KnowledgeArticleFilter,
  ProblemFilter,
  ProblemStatus,
  SOPFilter,
  SOPStatus,
  ServiceCatalogFilter,
  TicketFilter,
  TicketPriority,
  TicketStatus,
  TicketType,
  UserRole,
} from "../backend.d";

// RiskLevel has the same values as ImpactLevel (Low | Medium | High)
type RiskLevel = ImpactLevel;
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

// ── Problems ─────────────────────────────────────────────────────

export function useListProblems(filter: ProblemFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["problems", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProblems(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProblem(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["problem", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProblem(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProblem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
      priority,
    }: {
      title: string;
      description: string;
      category: string;
      priority: TicketPriority;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProblem(title, description, category, priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateProblemStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ProblemStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateProblemStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["problem", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateProblemDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      rootCause,
      workaround,
      assigneeId,
      linkedIncidentIds,
    }: {
      id: bigint;
      title: string;
      description: string;
      rootCause: string | null;
      workaround: string | null;
      assigneeId: Principal | null;
      linkedIncidentIds: bigint[];
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateProblemDetails(
        id,
        title,
        description,
        rootCause,
        workaround,
        assigneeId,
        linkedIncidentIds,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["problem", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

export function useAddCommentToProblem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      problemId,
      text,
    }: { problemId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCommentToProblem(problemId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["problem", variables.problemId.toString()],
      });
    },
  });
}

// ── Changes ──────────────────────────────────────────────────────

export function useListChangeRequests(filter: ChangeFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["changes", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChangeRequests(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useChangeRequest(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["change", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getChangeRequest(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateChangeRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
      changeType,
      priority,
      impact,
      risk,
      approverIds,
      plannedStart,
      plannedEnd,
    }: {
      title: string;
      description: string;
      category: string;
      changeType: ChangeType;
      priority: TicketPriority;
      impact: ImpactLevel;
      risk: RiskLevel;
      approverIds: Principal[];
      plannedStart: bigint;
      plannedEnd: bigint | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createChangeRequest(
        title,
        description,
        category,
        changeType,
        priority,
        impact,
        risk,
        approverIds,
        plannedStart,
        plannedEnd,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateChangeStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ChangeStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateChangeStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["change", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useSubmitChangeForApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitChangeForApproval(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["change", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["changes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useApproveChange() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      comment,
    }: { id: bigint; comment: string | null }) => {
      if (!actor) throw new Error("Not connected");
      await actor.approveChange(id, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["change", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["changes"] });
    },
  });
}

export function useRejectChange() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      comment,
    }: { id: bigint; comment: string | null }) => {
      if (!actor) throw new Error("Not connected");
      await actor.rejectChange(id, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["change", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["changes"] });
    },
  });
}

export function useAddCommentToChange() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      changeId,
      text,
    }: { changeId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCommentToChange(changeId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["change", variables.changeId.toString()],
      });
    },
  });
}

// ── Assets ───────────────────────────────────────────────────────

export function useListAssets(filter: AssetFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assets", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssets(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAsset(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["asset", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAsset(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      assetType,
      status,
      manufacturer,
      model,
      serialNumber,
      assetTag,
      location,
      purchaseDate,
      warrantyExpiry,
      cost,
      description,
    }: {
      name: string;
      assetType: AssetType;
      status: AssetStatus;
      manufacturer: string | null;
      model: string | null;
      serialNumber: string | null;
      assetTag: string;
      location: string | null;
      purchaseDate: bigint | null;
      warrantyExpiry: bigint | null;
      cost: bigint | null;
      description: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createAsset(
        name,
        assetType,
        status,
        manufacturer,
        model,
        serialNumber,
        assetTag,
        location,
        purchaseDate,
        warrantyExpiry,
        cost,
        description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      assetType,
      status,
      manufacturer,
      model,
      serialNumber,
      assetTag,
      location,
      assignedTo,
      purchaseDate,
      warrantyExpiry,
      cost,
      description,
    }: {
      id: bigint;
      name: string;
      assetType: AssetType;
      status: AssetStatus;
      manufacturer: string | null;
      model: string | null;
      serialNumber: string | null;
      assetTag: string;
      location: string | null;
      assignedTo: Principal | null;
      purchaseDate: bigint | null;
      warrantyExpiry: bigint | null;
      cost: bigint | null;
      description: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAsset(
        id,
        name,
        assetType,
        status,
        manufacturer,
        model,
        serialNumber,
        assetTag,
        location,
        assignedTo,
        purchaseDate,
        warrantyExpiry,
        cost,
        description,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["asset", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateAssetStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: AssetStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateAssetStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["asset", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteAsset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ── Service Catalog ───────────────────────────────────────────────

export function useListServiceCatalogItems(filter: ServiceCatalogFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["serviceCatalog", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listServiceCatalogItems(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetServiceCatalogItem(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["serviceCatalogItem", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getServiceCatalogItem(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateServiceCatalogItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      category,
      description,
      slaInfo,
      isAvailable,
    }: {
      name: string;
      category: string;
      description: string;
      slaInfo: string;
      isAvailable: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createServiceCatalogItem(
        name,
        category,
        description,
        slaInfo,
        isAvailable,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceCatalog"] });
    },
  });
}

export function useUpdateServiceCatalogItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category,
      description,
      slaInfo,
      isAvailable,
    }: {
      id: bigint;
      name: string;
      category: string;
      description: string;
      slaInfo: string;
      isAvailable: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateServiceCatalogItem(
        id,
        name,
        category,
        description,
        slaInfo,
        isAvailable,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["serviceCatalogItem", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["serviceCatalog"] });
    },
  });
}

export function useDeleteServiceCatalogItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteServiceCatalogItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceCatalog"] });
    },
  });
}

export function useRequestFromCatalog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      details,
    }: { itemId: bigint; details: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.requestFromCatalog(itemId, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// ── Knowledge Base ────────────────────────────────────────────────

export function useListKnowledgeArticles(filter: KnowledgeArticleFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["knowledgeArticles", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listKnowledgeArticles(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetKnowledgeArticle(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["knowledgeArticle", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getKnowledgeArticle(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateKnowledgeArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      category,
      content,
      tags,
      isPublished,
    }: {
      title: string;
      category: string;
      content: string;
      tags: string[];
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createKnowledgeArticle(
        title,
        category,
        content,
        tags,
        isPublished,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeArticles"] });
    },
  });
}

export function useUpdateKnowledgeArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      category,
      content,
      tags,
      isPublished,
    }: {
      id: bigint;
      title: string;
      category: string;
      content: string;
      tags: string[];
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateKnowledgeArticle(
        id,
        title,
        category,
        content,
        tags,
        isPublished,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledgeArticle", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["knowledgeArticles"] });
    },
  });
}

export function useDeleteKnowledgeArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteKnowledgeArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeArticles"] });
    },
  });
}

// ── SOPs ──────────────────────────────────────────────────────────

export function useListSOPs(filter: SOPFilter) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sops", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSOPs(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSOP(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["sop", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSOP(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateSOP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      category,
      content,
      version,
      status,
    }: {
      title: string;
      category: string;
      content: string;
      version: string;
      status: SOPStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createSOP(title, category, content, version, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    },
  });
}

export function useUpdateSOP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      category,
      content,
      version,
    }: {
      id: bigint;
      title: string;
      category: string;
      content: string;
      version: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateSOP(id, title, category, content, version);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sop", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    },
  });
}

export function useUpdateSOPStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: SOPStatus }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateSOPStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sop", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    },
  });
}

export function useDeleteSOP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteSOP(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    },
  });
}
