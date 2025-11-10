import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposalType:
    | "grant"
    | "treasury_allocation"
    | "platform_feature"
    | "collective_training"
    | "moderation"
    | "partnership";

  // Proposer
  proposerId: string;
  proposer: {
    username: string;
    avatarUrl: string;
    reputation: number;
  };

  // Voting
  votingStartsAt: Date;
  votingEndsAt: Date;
  quorumRequired: number; // percentage
  approvalThreshold: number; // percentage

  // Results
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotingPower: number;
  status: "draft" | "active" | "passed" | "rejected" | "executed" | "cancelled";

  // Execution
  executionTxHash: string | null;
  executedAt: Date | null;
  executionNotes: string | null;

  // Details
  requestedAmount: number | null; // If treasury allocation
  recipients: string[] | null; // If grants
  featureDescription: string | null; // If platform feature
  trainingDetails: any | null; // If collective training

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  discussionUrl: string | null;
  tags: string[];
}

interface CreateProposalData {
  title: string;
  description: string;
  proposalType:
    | "grant"
    | "treasury_allocation"
    | "platform_feature"
    | "collective_training"
    | "moderation"
    | "partnership";
  proposerId: string;
  proposer: {
    username: string;
    avatarUrl: string;
    reputation: number;
  };
  votingStartsAt: Date;
  votingEndsAt: Date;
  quorumRequired: number;
  approvalThreshold: number;
  requestedAmount: number | null;
  recipients: string[] | null;
  featureDescription: string | null;
  trainingDetails: any | null;
  discussionUrl: string | null;
  tags: string[];
}


interface DAOVote {
  id: string;
  proposalId: string;
  userId: string;
  user: {
    username: string;
    avatarUrl: string;
  };
  voteChoice: "for" | "against" | "abstain";
  votingPower: number;
  votedAt: Date;
  txHash: string;
  reasoning: string | null;
}

interface DAOTreasury {
  totalBalance: number; // ETH
  balanceUSD: number;
  totalRevenue: number;
  totalDistributed: number;
  activeProposals: number;

  revenueBreakdown: {
    collectiveQueries: number;
    platformFees: number;
    nftSales: number;
    donations: number;
  };

  distributionBreakdown: {
    grants: number;
    development: number;
    marketing: number;
    operations: number;
  };
}

interface DAOState {
  // Proposals
  proposals: DAOProposal[];
  activeProposals: DAOProposal[];
  userVotes: DAOVote[];

  // Treasury
  treasury: DAOTreasury | null;

  // User state
  userVotingPower: number;
  userDelegatedPower: number;
  userAvailablePower: number;

  // UI state
  isCreatingProposal: boolean;
  isVoting: boolean;
  isExecuting: boolean;

  // Actions
  loadProposals: () => Promise<void>;
  loadTreasury: () => Promise<void>;
  loadUserVotingPower: (userId: string) => Promise<void>;
  createProposal: (
    proposal: Omit<DAOProposal, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  voteOnProposal: (
    proposalId: string,
    vote: "for" | "against" | "abstain",
    reasoning?: string
  ) => Promise<void>;
  executeProposal: (proposalId: string) => Promise<void>;
  cancelProposal: (proposalId: string) => Promise<void>;
  delegateVotingPower: (toUserId: string, amount: number) => Promise<void>;
}

// Mock data for demonstration
const mockProposals: DAOProposal[] = [
  {
    id: "prop_1",
    title: "Fund 10 Emerging Poets with $1,000 Grants",
    description:
      "Support the next generation of poetic talent by providing grants to 10 promising emerging poets. Each poet will receive $1,000 to focus on their craft and produce new work for the platform.",
    proposalType: "grant",
    proposerId: "user1",
    proposer: {
      username: "sarah_poet",
      avatarUrl: "/avatars/sarah.jpg",
      reputation: 95,
    },
    votingStartsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    votingEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    quorumRequired: 40,
    approvalThreshold: 60,
    votesFor: 245000,
    votesAgainst: 78000,
    votesAbstain: 12000,
    totalVotingPower: 500000,
    status: "active",
    executionTxHash: null,
    executedAt: null,
    executionNotes: null,
    requestedAmount: 10000,
    recipients: [
      "poet_alice",
      "poet_bob",
      "poet_carol",
      "poet_dave",
      "poet_eve",
      "poet_frank",
      "poet_grace",
      "poet_henry",
      "poet_ivy",
      "poet_jack",
    ],
    featureDescription: null,
    trainingDetails: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    discussionUrl: "https://forum.collectivepoetry.io/proposals/1",
    tags: ["grants", "emerging-artists", "funding"],
  },
  {
    id: "prop_2",
    title: "Upgrade Collective Consciousness to v3 with New Training Data",
    description:
      "Train a new version of the Collective Consciousness model using the latest 5,000 high-quality poems. This will improve response quality and enable new creative capabilities.",
    proposalType: "collective_training",
    proposerId: "user2",
    proposer: {
      username: "tech_poet",
      avatarUrl: "/avatars/tech.jpg",
      reputation: 88,
    },
    votingStartsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    votingEndsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    quorumRequired: 35,
    approvalThreshold: 55,
    votesFor: 189000,
    votesAgainst: 42000,
    votesAbstain: 15000,
    totalVotingPower: 500000,
    status: "active",
    executionTxHash: null,
    executedAt: null,
    executionNotes: null,
    requestedAmount: 15000,
    recipients: null,
    featureDescription: null,
    trainingDetails: {
      poemsCount: 5000,
      trainingTime: "2 weeks",
      modelSize: "7B parameters",
      newFeatures: [
        "better metaphor generation",
        "improved emotional depth",
        "multi-lingual support",
      ],
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    discussionUrl: "https://forum.collectivepoetry.io/proposals/2",
    tags: ["collective", "ai", "upgrade", "training"],
  },
  {
    id: "prop_3",
    title: "Implement Advanced Collaboration Features",
    description:
      "Add real-time co-writing tools, version history, and improved ownership negotiation to the collaboration system.",
    proposalType: "platform_feature",
    proposerId: "user3",
    proposer: {
      username: "collab_leader",
      avatarUrl: "/avatars/collab.jpg",
      reputation: 92,
    },
    votingStartsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    votingEndsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    quorumRequired: 30,
    approvalThreshold: 50,
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    totalVotingPower: 500000,
    status: "draft",
    executionTxHash: null,
    executedAt: null,
    executionNotes: null,
    requestedAmount: 8000,
    recipients: null,
    featureDescription:
      "Real-time editing, version control, improved UI, and automated ownership splits based on contribution tracking.",
    trainingDetails: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    discussionUrl: "https://forum.collectivepoetry.io/proposals/3",
    tags: ["collaboration", "features", "development"],
  },
  {
    id: "prop_4",
    title: "Community Poetry Anthology Publication",
    description:
      "Publish a physical anthology featuring the top 50 poems from the platform, with proceeds funding future grants.",
    proposalType: "treasury_allocation",
    proposerId: "user4",
    proposer: {
      username: "publisher_poet",
      avatarUrl: "/avatars/publisher.jpg",
      reputation: 85,
    },
    votingStartsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    votingEndsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    quorumRequired: 40,
    approvalThreshold: 60,
    votesFor: 320000,
    votesAgainst: 95000,
    votesAbstain: 25000,
    totalVotingPower: 500000,
    status: "passed",
    executionTxHash: "0xabc123def456...",
    executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    executionNotes:
      "Funds transferred to publication fund. Anthology production started.",
    requestedAmount: 20000,
    recipients: null,
    featureDescription: null,
    trainingDetails: null,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    discussionUrl: "https://forum.collectivepoetry.io/proposals/4",
    tags: ["publication", "anthology", "marketing"],
  },
];

export const useDAOStore = create<DAOState>()(
  devtools(
    (set, get) => ({
      // Initial State
      proposals: [],
      activeProposals: [],
      userVotes: [],
      treasury: null,
      userVotingPower: 1250,
      userDelegatedPower: 500,
      userAvailablePower: 750,
      isCreatingProposal: false,
      isVoting: false,
      isExecuting: false,

      // Load proposals
      loadProposals: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const activeProposals = mockProposals.filter(
          (p) => p.status === "active" || p.status === "draft"
        );

        set({
          proposals: mockProposals,
          activeProposals,
        });
      },

      // Load treasury data
      loadTreasury: async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const treasury: DAOTreasury = {
          totalBalance: 34.2,
          balanceUSD: 102600, // Assuming $3,000 per ETH
          totalRevenue: 156.8,
          totalDistributed: 122.6,
          activeProposals: 2,
          revenueBreakdown: {
            collectiveQueries: 45.2,
            platformFees: 67.8,
            nftSales: 38.9,
            donations: 4.9,
          },
          distributionBreakdown: {
            grants: 56.3,
            development: 32.1,
            marketing: 18.7,
            operations: 15.5,
          },
        };

        set({ treasury });
      },

      // Load user voting power
      loadUserVotingPower: async (userId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock user voting power based on contributions
        const mockPower = Math.floor(Math.random() * 2000) + 500;
        const mockDelegated = Math.floor(mockPower * 0.4);

        set({
          userVotingPower: mockPower,
          userDelegatedPower: mockDelegated,
          userAvailablePower: mockPower - mockDelegated,
        });
      },

      // Create new proposal
      createProposal: async (proposalData: CreateProposalData) => {
        set({ isCreatingProposal: true });

        // Simulate blockchain transaction
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const newProposal: DAOProposal = {
          id: `prop_${Date.now()}`,
          ...proposalData,
          createdAt: new Date(),
          updatedAt: new Date(),
          votesFor: 0,
          votesAgainst: 0,
          votesAbstain: 0,
          totalVotingPower: 500000, // Mock total supply
          status: "draft",
          executionTxHash: null,
          executedAt: null,
          executionNotes: null,
        };

        set((state) => ({
          proposals: [newProposal, ...state.proposals],
          activeProposals: [newProposal, ...state.activeProposals],
          isCreatingProposal: false,
        }));
      },

      // Vote on proposal
      voteOnProposal: async (
        proposalId: string,
        voteChoice: "for" | "against" | "abstain",
        reasoning?: string
      ) => {
        set({ isVoting: true });

        const { userAvailablePower, proposals } = get();

        // Simulate blockchain voting
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const updatedProposals = proposals.map((proposal) => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votesFor:
                voteChoice === "for"
                  ? proposal.votesFor + userAvailablePower
                  : proposal.votesFor,
              votesAgainst:
                voteChoice === "against"
                  ? proposal.votesAgainst + userAvailablePower
                  : proposal.votesAgainst,
              votesAbstain:
                voteChoice === "abstain"
                  ? proposal.votesAbstain + userAvailablePower
                  : proposal.votesAbstain,
              updatedAt: new Date(),
            };
          }
          return proposal;
        });

        const newVote: DAOVote = {
          id: `vote_${Date.now()}`,
          proposalId,
          userId: "current_user",
          user: {
            username: "current_user",
            avatarUrl: "/avatars/current.jpg",
          },
          voteChoice,
          votingPower: userAvailablePower,
          votedAt: new Date(),
          txHash: `0x${Math.random().toString(16).substr(2)}`,
          reasoning: reasoning || null,
        };

        set((state) => ({
          proposals: updatedProposals,
          activeProposals: updatedProposals.filter(
            (p: DAOProposal) => p.status === "active" || p.status === "draft"
          ),
          userVotes: [newVote, ...state.userVotes],
          isVoting: false,
        }));
      },

      // Execute proposal
      executeProposal: async (proposalId: string) => {
        set({ isExecuting: true });

        // Simulate blockchain execution
        await new Promise((resolve) => setTimeout(resolve, 4000));

        const updatedProposals = get().proposals.map(
          (proposal: DAOProposal): DAOProposal => {
            if (proposal.id === proposalId && proposal.status === "passed") {
              return {
                ...proposal,
                status: "executed",
                executionTxHash: `0x${Math.random().toString(16).slice(2)}`,
                executedAt: new Date(),
                executionNotes: "Proposal executed successfully on blockchain",
                updatedAt: new Date(),
              } as DAOProposal;
            }
            return proposal;
          }
        );

        set({
          proposals: updatedProposals,
          activeProposals: updatedProposals.filter(
            (p): p is DAOProposal => p.status === "active" || p.status === "draft"
          ),
          isExecuting: false,
        });
      },

      // Cancel proposal
      cancelProposal: async (proposalId: string) => {
        const updatedProposals = get().proposals.map((proposal) => {
          if (proposal.id === proposalId && proposal.status === "draft") {
            return {
              ...proposal,
              status: "cancelled" as const,
              updatedAt: new Date(),
            };
          }
          return proposal;
        });

        set({
          proposals: updatedProposals,
          activeProposals: updatedProposals.filter(
            (p): p is DAOProposal => p.status === "active" || p.status === "draft"
          ),
          isExecuting: false,
        });
      },

      // Delegate voting power
      delegateVotingPower: async (toUserId: string, amount: number) => {
        const { userAvailablePower } = get();

        if (amount > userAvailablePower) {
          throw new Error("Insufficient voting power");
        }

        // Simulate blockchain delegation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        set((state) => ({
          userDelegatedPower: state.userDelegatedPower + amount,
          userAvailablePower: state.userAvailablePower - amount,
        }));
      },
    }),
    {
      name: "dao-store",
    }
  )
);
