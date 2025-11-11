import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios, { AxiosResponse } from "axios";
import { usePersistedAuthStore } from "./persisted-auth-store";

// --- ENUMS MIRRORING PRISMA SCHEMA ---
// These must match the backend's LicenseType and PoemMood exactly.
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

// --- INTERFACES ---

interface AISuggestion {
    id: string; // Assuming AI suggestions get an ID on the frontend
    type: 'word_choice' | 'rhythm' | 'imagery' | 'structure' | 'metaphor';
    original: string;
    suggestion: string;
    reasoning: string;
    applied: boolean;
}

interface PoemDraft {
    // Core DTO fields
    id?: string; // Optional ID for existing drafts (important for delete/update)
    title: string;
    content: string;
    tags?: string[];
    mood?: PoemMood | null; // Correctly using PoemMood enum
    licenseType: LicenseType; // Correctly using LicenseType enum
    isAnonymous?: boolean; // Added from DTO
    publishNow?: boolean; // Added from DTO

    // Frontend/AI specific fields (must be excluded from DTO payload)
    themes?: string[];
    qualityScore?: number | null;
    aiSuggestions?: AISuggestion[];
}

interface SoloPoetState {
    // Draft Management
    currentDraft: PoemDraft | null;
    drafts: PoemDraft[];

    // AI Features
    isGeneratingFeedback: boolean;
    aiSuggestions: AISuggestion[];
    qualityScore: number | null;

    // Publishing
    isPublishing: boolean;
    publishedPoem: any | null;

    // Actions
    createNewDraft: () => void;
    updateDraft: (updates: Partial<PoemDraft>) => void;
    saveDraft: () => Promise<void>;
    generateAIFeedback: () => Promise<void>;
    publishPoem: (draft: PoemDraft) => Promise<void>;
    loadDrafts: () => Promise<void>;
    deleteDraft: (id: string) => void;
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

const getAccessToken = () => {
    const { accessToken } = usePersistedAuthStore.getState();
    return accessToken;
}

const setAuthHeader = (token: string | null) => {
    if (token) {
        poemsApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete poemsApiClient.defaults.headers.common['Authorization'];
    }
};

// --- MOCK DATA (Updated to include ID and use Enums) ---

const mockDrafts: PoemDraft[] = [
    {
        id: 'draft-1234',
        title: 'Urban Echoes',
        content: 'The city breathes in neon sighs,\nConcrete canyons touch the skies,\nA million stories walk these streets,\nIn rhythm with a thousand beats.',
        tags: ['urban', 'modern', 'city'],
        themes: ['technology', 'society'],
        mood: PoemMood.CONTEMPLATIVE, // Using the new enum
        licenseType: LicenseType.ALL_RIGHTS_RESERVED, // Using the new enum
        qualityScore: 72,
        aiSuggestions: [],
        isAnonymous: false,
        publishNow: false,
    }
];


// --- ZUSTAND STORE IMPLEMENTATION ---

export const useSoloPoetStore = create<SoloPoetState>()(
    devtools((set, get) => ({
        // Initial State
        currentDraft: null,
        drafts: mockDrafts, // Initialize with mock data for testing
        isGeneratingFeedback: false,
        aiSuggestions: [],
        qualityScore: null,
        isPublishing: false,
        publishedPoem: null,

        // Create new draft
        createNewDraft: () => {
            const newDraft: PoemDraft = {
                title: '',
                content: '',
                tags: [],
                themes: [],
                mood: null,
                // Using the correct enum default value
                licenseType: LicenseType.ALL_RIGHTS_RESERVED, 
                qualityScore: null,
                aiSuggestions: [],
                isAnonymous: false,
                publishNow: false,
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

        // Save draft (Constructs DTO payload correctly)
        saveDraft: async () => {
            const { currentDraft } = get();
            
            if (!currentDraft || !currentDraft.content.trim()) {
                console.warn("Cannot save draft: current draft content is empty or missing.");
                return;
            }

            setAuthHeader(getAccessToken());

            try {
                // 💡 FIX: Construct the payload explicitly to match CreatePoemDto
                const createPoemPayload = {
                    title: currentDraft.title,
                    content: currentDraft.content,
                    tags: currentDraft.tags,
                    mood: currentDraft.mood || undefined, // Send as undefined if null
                    licenseType: currentDraft.licenseType,
                    // Provide defaults for optional boolean fields if they are missing
                    isAnonymous: currentDraft.isAnonymous || false, 
                    publishNow: currentDraft.publishNow || false, 
                };
                
                console.log("Draft payload being sent (DTO): ", createPoemPayload);
                
                // Determine if this is a new draft (POST) or an update (PUT)
                // Assuming ID means it exists and should be updated.
                const isExistingDraft = !!currentDraft.id;

                let response: AxiosResponse<any>;

                if (isExistingDraft) {
                    // Update existing draft
                    response = await poemsApiClient.put(`/${currentDraft.id}`, createPoemPayload);
                } else {
                    // Create new draft
                    response = await poemsApiClient.post('', createPoemPayload);
                }

                console.log("Draft saved successfully: ", response);

                // Update the currentDraft with the ID returned by the backend for new creations
                if (!isExistingDraft && response.data.id) {
                     set({ currentDraft: { ...currentDraft, id: response.data.id } });
                }

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
                // Prepare the DTO payload (AI endpoint usually only needs content)
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
                
                // Map the backend suggestions array (apiData.suggestions)
                const newSuggestions: AISuggestion[] = apiData.suggestions
                    .filter((s: any) => s && s.suggestion) 
                    .map((s: any) => ({
                        // Assuming the backend provides an ID or we generate one
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

                // Update current draft with score and suggestions
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

        // Publish Poem (Mocked to use PoemDraft)
        publishPoem: async (draft: PoemDraft) => {
            set({ isPublishing: true });

            setAuthHeader(getAccessToken());

            try {
                // 💡 NOTE: In a real app, this API call would use the DTO structure
                // const response = await poemsApiClient.post('/publish', createPoemPayload); 
                await new Promise(resolve => setTimeout(resolve, 3000));

                const publishedPoem = {
                    ...draft,
                    nftTokenId: `nft_${Math.random().toString(36).substr(2, 9)}`,
                    views: 0,
                    likes: 0,
                    comments: 0,
                };

                // Remove from drafts locally and ensure updatedDrafts is defined
                const { drafts } = get();
                const updatedDrafts = drafts.filter(d => d.id !== draft.id);


                set({
                    publishedPoem,
                    drafts: updatedDrafts,
                    currentDraft: null,
                    isPublishing: false,
                });
            } catch (error) {
                console.error("Failed to publish poem:", error);
                set({ isPublishing: false });
            }
        },

        // Load drafts (Uses mock data)
        loadDrafts: async () => {
            setAuthHeader(getAccessToken());

            try {
                // You would replace this mock with:
                // const response = await poemsApiClient.get('/drafts');
                // const apiResponse: PoemDraft[] = response.data.drafts; 
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockResponse: PoemDraft[] = mockDrafts;

                set({ drafts: mockResponse });
            } catch (error) {
                console.error("Failed to load drafts:", error);
            }
        },

        // Delete draft 
        deleteDraft: (id: string) => {
            // In a real app, you'd add an API call here:
            // poemsApiClient.delete(`/drafts/${id}`); 

            const { drafts, currentDraft } = get();
            const updatedDrafts = drafts.filter(d => d.id !== id);

            set({
                drafts: updatedDrafts,
                currentDraft: currentDraft?.id === id ? null : currentDraft,
            });
        },
    }), {
        name: 'solo-poet-store',
    })
);