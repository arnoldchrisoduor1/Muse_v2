import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { AxiosResponse } from "axios";
import { useAuthStore } from "./auth-store";

// --- ENUMS MIRRORING PRISMA SCHEMA ---
export enum LicenseType {
    ALL_RIGHTS_RESERVED = 'ALL_RIGHTS_RESERVED',
    CC_BY = 'CC_BY',
    CC_BY_SA = 'CC_BY_SA',
    CC_BY_NC = 'CC_BY_NC',
    PUBLIC_DOMAIN = 'PUBLIC_DOMAIN',
}

export enum PoemMood {
    MELANCHOLIC = 'MELANCHOLIC',
    HOPEFUL = 'HOPEFUL',
    ANGRY = 'ANGRY',
    PEACEFUL = 'PEACEFUL',
    ANXIOUS = 'ANXIOUS',
    JOYFUL = 'JOYFUL',
    CONTEMPLATIVE = 'CONTEMPLATIVE',
    DEFIANT = 'DEFIANT',
}

export enum PoemStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

// --- INTERFACES ---

interface AISuggestion {
    id: string;
    type: 'word_choice' | 'rhythm' | 'imagery' | 'structure' | 'metaphor';
    original: string;
    suggestion: string;
    reasoning: string;
    applied: boolean;
}

interface Poem {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    mood?: PoemMood | null;
    licenseType: LicenseType;
    isAnonymous: boolean;
    status: PoemStatus;
    qualityScore?: number | null;
    themes?: string[];
    aiSuggestions?: AISuggestion[];
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    views?: number;
    likes?: number;
    earnings?: number;
    nftTokenId?: string;
    authorId: string;
}

interface PoemDraft {
    // Core DTO fields
    id?: string;
    title: string;
    content: string;
    tags?: string[];
    mood?: PoemMood | null;
    licenseType: LicenseType;
    isAnonymous?: boolean;
    publishNow?: boolean;

    // Frontend/AI specific fields
    themes?: string[];
    qualityScore?: number | null;
    aiSuggestions?: AISuggestion[];
    status?: PoemStatus; // Add status to distinguish drafts
}

interface SoloPoetState {
    // Poem Management
    currentDraft: PoemDraft | null;
    drafts: PoemDraft[];
    publishedPoems: Poem[];
    allPoems: Poem[]; // Combined poems for profile display

    // AI Features
    isGeneratingFeedback: boolean;
    aiSuggestions: AISuggestion[];
    qualityScore: number | null;

    // Publishing
    isPublishing: boolean;
    publishedPoem: any | null;

    // Loading states
    isLoadingPoems: boolean;

    // Actions
    createNewDraft: () => void;
    updateDraft: (updates: Partial<PoemDraft>) => void;
    saveDraft: () => Promise<void>;
    generateAIFeedback: () => Promise<void>;
    publishPoem: (draft: PoemDraft) => Promise<void>;
    loadPoems: (userId?: string) => Promise<void>; // Updated function
    deleteDraft: (id: string) => void;
    setPoems: (poems: Poem[]) => void;
}

// --- API SETUP ---

const POEMS_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const poemsApiClient = axios.create({
    baseURL: `${POEMS_API_URL}/api/v1/poems`, 
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// const userApiClient = axios.create({
//     baseURL: `${POEMS_API_URL}/api/v1/users`, 
//     withCredentials: true,
//     timeout: 10000,
//     headers: {
//         'Content-Type': 'application/json',
//     }
// });

const getAccessToken = () => {
    const { accessToken } = useAuthStore();
    return accessToken;
}

const setAuthHeader = (token: string | null) => {
    if (token) {
        poemsApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // userApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete poemsApiClient.defaults.headers.common['Authorization'];
        // delete userApiClient.defaults.headers.common['Authorization'];
    }
};

// Helper function to map API response to Poem interface
const mapApiPoemToPoem = (apiPoem: any): Poem => ({
    id: apiPoem.id,
    title: apiPoem.title,
    content: apiPoem.content,
    tags: apiPoem.tags || [],
    mood: apiPoem.mood as PoemMood || null,
    licenseType: apiPoem.licenseType as LicenseType,
    isAnonymous: apiPoem.isAnonymous || false,
    status: apiPoem.status as PoemStatus,
    qualityScore: apiPoem.qualityScore || null,
    themes: apiPoem.themes || [],
    aiSuggestions: apiPoem.aiSuggestions || [],
    createdAt: new Date(apiPoem.createdAt),
    updatedAt: new Date(apiPoem.updatedAt),
    publishedAt: apiPoem.publishedAt ? new Date(apiPoem.publishedAt) : undefined,
    views: apiPoem.views || 0,
    likes: apiPoem.likes || 0,
    earnings: apiPoem.earnings || 0,
    nftTokenId: apiPoem.nftTokenId,
    authorId: apiPoem.authorId,
});

// Helper function to map PoemDraft to API payload
const mapDraftToApiPayload = (draft: PoemDraft) => ({
    title: draft.title,
    content: draft.content,
    tags: draft.tags,
    mood: draft.mood || undefined,
    licenseType: draft.licenseType,
    isAnonymous: draft.isAnonymous || false,
    publishNow: draft.publishNow || false,
});

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useSoloPoetStore = create<SoloPoetState>()(
    devtools((set, get) => ({
        // Initial State
        currentDraft: null,
        drafts: [],
        publishedPoems: [],
        allPoems: [],
        isGeneratingFeedback: false,
        aiSuggestions: [],
        qualityScore: null,
        isPublishing: false,
        publishedPoem: null,
        isLoadingPoems: false,

        // Create new draft
        createNewDraft: () => {
            const newDraft: PoemDraft = {
                title: '',
                content: '',
                tags: [],
                themes: [],
                mood: null,
                licenseType: LicenseType.ALL_RIGHTS_RESERVED,
                qualityScore: null,
                aiSuggestions: [],
                isAnonymous: false,
                publishNow: false,
                status: PoemStatus.DRAFT,
            };
            set({ currentDraft: newDraft });
        },

        // Update draft
        updateDraft: (updates) => {
            const { currentDraft } = get();
            if (currentDraft) {
                set({
                    currentDraft: {
                        ...currentDraft,
                        ...updates,
                    }
                });
            }
        },

        // Save draft
        saveDraft: async () => {
            const { currentDraft } = get();
            
            if (!currentDraft || !currentDraft.content.trim()) {
                console.warn("Cannot save draft: current draft content is empty or missing.");
                return;
            }

            setAuthHeader(getAccessToken());

            try {
                const createPoemPayload = mapDraftToApiPayload(currentDraft);
                
                console.log("Draft payload being sent: ", createPoemPayload);
                
                const isExistingDraft = !!currentDraft.id;

                let response: AxiosResponse<any>;

                if (isExistingDraft) {
                    response = await poemsApiClient.put(`/${currentDraft.id}`, createPoemPayload);
                } else {
                    response = await poemsApiClient.post('', createPoemPayload);
                }

                console.log("Draft saved successfully: ", response);

                if (!isExistingDraft && response.data.id) {
                    set({ currentDraft: { ...currentDraft, id: response.data.id } });
                }

                // Reload poems to get updated list
                await get().loadPoems();

            } catch (error) {
                console.error("Failed to save draft:", error);
            }
        },

        // Generate AI Feedback
        generateAIFeedback: async () => {
            const { currentDraft } = get();

            console.log("Making AI request with: ", currentDraft);

            if (!currentDraft || !currentDraft.content.trim()) {
                console.warn("Cannot generate feedback: current draft content is empty or missing.");
                set({ isGeneratingFeedback: false }); 
                return;
            }

            set({ isGeneratingFeedback: true });
            setAuthHeader(getAccessToken());

            try {
                const payload = {
                    title: currentDraft.title || 'Untitled Draft',
                    content: currentDraft.content,
                };

                const response: AxiosResponse<any> = await poemsApiClient.post(
                    '/feedback',
                    payload
                );

                const apiData = response.data;
                console.log("Response from AI feedback: ", apiData);
                
                const newSuggestions: AISuggestion[] = apiData.suggestions
                    .filter((s: any) => s && s.suggestion) 
                    .map((s: any) => ({
                        id: s.id || Math.random().toString(36).substring(2, 9),
                        type: s.type || 'word_choice', 
                        original: s.original || '',
                        suggestion: s.suggestion || '',
                        reasoning: s.reasoning || 'AI analysis provided this suggestion.',
                        applied: false,
                    }));

                const newScore = apiData.qualityScore;

                set({
                    aiSuggestions: newSuggestions,
                    qualityScore: newScore,
                    isGeneratingFeedback: false,
                });

                set({
                    currentDraft: {
                        ...currentDraft,
                        qualityScore: newScore,
                        aiSuggestions: newSuggestions,
                    }
                });
            } catch (error) {
                console.error("Failed to generate AI feedback:", axios.isAxiosError(error) ? error.response?.data : error);
                set({ isGeneratingFeedback: false });
            }
        },

        // Publish Poem
        publishPoem: async (draft: PoemDraft) => {
            set({ isPublishing: true });
            setAuthHeader(getAccessToken());

            try {
                const publishPayload = {
                    ...mapDraftToApiPayload(draft),
                    publishNow: true,
                };

                const response = await poemsApiClient.post('/publish', publishPayload);
                
                const publishedPoem = response.data;

                // Remove from drafts and add to published poems
                const { drafts } = get();
                const updatedDrafts = drafts.filter(d => d.id !== draft.id);

                set({
                    publishedPoem,
                    drafts: updatedDrafts,
                    currentDraft: null,
                    isPublishing: false,
                });

                // Reload poems to get updated list
                await get().loadPoems();

            } catch (error) {
                console.error("Failed to publish poem:", error);
                set({ isPublishing: false });
            }
        },

        // Load Poems from API - Updated function
       // Load poems (userId optional)
loadPoems: async (userId?: string) => {
    console.log("loadPoems called with userId:", userId);

    set({ isLoadingPoems: true });
    setAuthHeader(getAccessToken());

    try {
        // If no userId passed, try current user id from state
        const effectiveUserId = userId;

        // Choose endpoint intelligently:
        // - If we have an explicit user id: /user/:id
        // - If not, call root poems list endpoint (adjust to your API if different)
        const path = effectiveUserId ? `/user/${encodeURIComponent(effectiveUserId)}` : `/`;

        const response: AxiosResponse<any> = await poemsApiClient.get(path);
        console.log("Load poems response: ", response.data);

        // Normalize the API response to an array of poems
        let apiPoems: any[] = [];

        if (Array.isArray(response.data)) {
            apiPoems = response.data;
        } else if (Array.isArray(response.data.poems)) {
            apiPoems = response.data.poems;
        } else if (Array.isArray(response.data.items)) {
            apiPoems = response.data.items; // pagination shape
        } else if (Array.isArray(response.data.data)) {
            apiPoems = response.data.data;
        } else {
            // Defensive fallback: if response.data itself looks like a single poem object,
            // convert to array; otherwise keep empty array
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                // If it's an object with keys that look like poem fields, try to detect that:
                const maybePoem = response.data;
                const hasPoemKeys = ['id','title','content'].some(k => k in maybePoem);
                if (hasPoemKeys) {
                    apiPoems = [maybePoem];
                } else {
                    // nothing recognized, leave apiPoems = []
                    console.warn('loadPoems: unrecognized response shape, returning empty array');
                }
            }
        }

        // Final guard: ensure we have an array
        if (!Array.isArray(apiPoems)) {
            console.warn('loadPoems: apiPoems is not an array after normalization. Setting to empty array.', apiPoems);
            apiPoems = [];
        }

        // Map API response to Poem objects (mapApiPoemToPoem must handle whatever fields your API provides)
        const poems: Poem[] = apiPoems.map(mapApiPoemToPoem);

        console.log("Load Poems mapped: ", poems);

        // Separate drafts and published poems
        const drafts = poems
            .filter(poem => poem.status === PoemStatus.DRAFT)
            .map(poem => ({
                id: poem.id,
                title: poem.title,
                content: poem.content,
                tags: poem.tags,
                mood: poem.mood,
                licenseType: poem.licenseType,
                isAnonymous: poem.isAnonymous,
                themes: poem.themes,
                qualityScore: poem.qualityScore,
                aiSuggestions: poem.aiSuggestions,
                publishNow: false,
            }));

        const publishedPoems = poems.filter(poem => poem.status === PoemStatus.PUBLISHED);

        set({
            allPoems: poems,
            drafts,
            publishedPoems,
            isLoadingPoems: false,
        });

        console.log(`Loaded ${poems.length} poems (${drafts.length} drafts, ${publishedPoems.length} published)`);

    } catch (error) {
        console.error("Failed to load poems:", error);
        set({ 
            isLoadingPoems: false,
            allPoems: [],
            drafts: [],
            publishedPoems: [],
        });
    }
},


        // Delete draft
        deleteDraft: async (id: string) => {
            setAuthHeader(getAccessToken());

            try {
                // API call to delete draft
                await poemsApiClient.delete(`/${id}`);

                // Update local state
                const { drafts, currentDraft } = get();
                const updatedDrafts = drafts.filter(d => d.id !== id);

                set({
                    drafts: updatedDrafts,
                    currentDraft: currentDraft?.id === id ? null : currentDraft,
                });

                // Reload poems to ensure consistency
                await get().loadPoems();

            } catch (error) {
                console.error("Failed to delete draft:", error);
                throw error;
            }
        },

        // Set poems directly (for external updates)
        setPoems: (poems: Poem[]) => {
            const drafts = poems
                .filter(poem => poem.status === PoemStatus.DRAFT)
                .map(poem => ({
                    id: poem.id,
                    title: poem.title,
                    content: poem.content,
                    tags: poem.tags,
                    mood: poem.mood,
                    licenseType: poem.licenseType,
                    isAnonymous: poem.isAnonymous,
                    themes: poem.themes,
                    qualityScore: poem.qualityScore,
                    aiSuggestions: poem.aiSuggestions,
                    publishNow: false,
                }));

            const publishedPoems = poems.filter(poem => poem.status === PoemStatus.PUBLISHED);

            set({
                allPoems: poems,
                drafts,
                publishedPoems,
            });
        },
    }), {
        name: 'solo-poet-store',
    })
);