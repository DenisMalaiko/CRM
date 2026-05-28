import React from "react";
import { render, screen } from "@testing-library/react";
import Stories from "./Stories";
import { TAIArtifact } from "../../../../../../models/AIArtifact";
import { AIArtifactType } from "../../../../../../enum/AIArtifactType";
import { AIArtifactStatus } from "../../../../../../enum/AIArtifactStatus";
import { MediaType } from "../../../../../../enum/MediaType";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ businessId: "biz-123" }),
}));

// Mock RTK Query hooks
const mockGetAiArtifacts = jest.fn();
const mockDeleteCreative = jest.fn();
const mockDeleteCreativeBatch = jest.fn();

jest.mock("../../../../../../store/artifact/artifactApi", () => ({
  useLazyGetAiArtifactsQuery: () => [mockGetAiArtifacts],
  useDeleteCreativeMutation: () => [mockDeleteCreative],
  useDeleteCreativeBatchMutation: () => [mockDeleteCreativeBatch],
}));

const mockGetProfiles = jest.fn();
jest.mock("../../../../../../store/profile/profileApi", () => ({
  useGetProfilesMutation: () => [mockGetProfiles],
}));

const mockGetProducts = jest.fn();
jest.mock("../../../../../../store/products/productsApi", () => ({
  useGetProductsMutation: () => [mockGetProducts],
}));

// Mock Redux
const mockDispatch = jest.fn();
let mockStories: TAIArtifact[] = [];

jest.mock("../../../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      artifactModule: { stories: mockStories },
      profileModule: { profiles: [] },
      productsModule: { products: [] },
    }),
}));

// Mock slice actions
jest.mock("../../../../../../store/artifact/artifactSlice", () => ({
  setStories: (data: unknown) => ({ type: "artifact/setStories", payload: data }),
}));

jest.mock("../../../../../../store/profile/profileSlice", () => ({
  setProfiles: (data: unknown) => ({ type: "profile/setProfiles", payload: data }),
}));

jest.mock("../../../../../../store/products/productsSlice", () => ({
  setProducts: (data: unknown) => ({ type: "products/setProducts", payload: data }),
}));

// Mock dialogs
jest.mock("./updateStoryDlg/UpdateStoryDlg", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../../../../components/createCreativeDlg/CreateCreativeDlg", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../../../../components/sliderDlg/SliderDlg", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../../../../components/editPhotoDlg/EditPhotoDlg", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../../../../components/confirmDlg/ConfirmDlg", () => ({
  confirm: jest.fn(),
}));

// Mock utilities
jest.mock("../../../../../../utils/showError", () => ({
  showError: jest.fn(),
}));

jest.mock("../../../../../../utils/toDate", () => ({
  toDate: (d: unknown) => String(d),
}));

jest.mock("../../../../../../utils/reactSelectStyles", () => ({
  centeredSelectStyles: {},
}));

jest.mock("../../../../../../utils/getStatusClass", () => ({
  getStatusClass: () => "",
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeStory(overrides: Partial<TAIArtifact> = {}): TAIArtifact {
  return {
    id: "story-1",
    businessId: "biz-123",
    businessProfileId: "profile-1",
    type: AIArtifactType.Post,
    outputJson: { headline: "Test Story" },
    status: AIArtifactStatus.Draft,
    products: [],
    createdAt: "2024-01-15T10:00:00Z",
    media: [],
    ...overrides,
  };
}

function renderComponent() {
  return render(<Stories />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Stories component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStories = [];
    mockGetAiArtifacts.mockResolvedValue({ data: { data: [] } });
    mockGetProfiles.mockResolvedValue({ data: { data: [] } });
    mockGetProducts.mockResolvedValue({ data: { data: [] } });
  });

  describe("default render", () => {
    test('renders "Stories" heading', () => {
      renderComponent();
      expect(screen.getByRole("heading", { name: /stories/i })).toBeInTheDocument();
    });

    test('renders "Create Story" button', () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /create story/i })).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    test('shows "No data" when stories list is empty', () => {
      mockStories = [];
      renderComponent();
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe("image media rendering", () => {
    test("renders an <img> element for a media item with type Image", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-1",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-1",
              order: 0,
              sourceUrl: "https://example.com/source.jpg",
              type: MediaType.Image,
              url: "https://example.com/image.jpg",
            },
          ],
        }),
      ];

      renderComponent();

      const img = screen.getByRole("img", { name: /ai story/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    test("does not render a <video> element when media type is Image", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-1",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-1",
              order: 0,
              sourceUrl: "https://example.com/source.jpg",
              type: MediaType.Image,
              url: "https://example.com/image.jpg",
            },
          ],
        }),
      ];

      renderComponent();

      expect(document.querySelector("video")).not.toBeInTheDocument();
    });
  });

  describe("video media rendering", () => {
    test("renders a <video> element for a media item with type Video", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
    });

    test("video element has the correct src", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
    });

    test("video element uses sourceUrl as poster", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("poster", "https://example.com/poster.jpg");
    });

    test("video element has controls attribute", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("controls");
    });

    test("video element has playsInline attribute", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("playsinline");
    });

    test('video element has preload="metadata"', () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("preload", "metadata");
    });

    test("does not render an <img> element when media type is Video", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-2",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-2",
              order: 0,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    test("video element renders without poster when sourceUrl is null", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-3",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-3",
              order: 0,
              sourceUrl: null as any,
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).not.toHaveAttribute("poster");
    });
  });

  describe("mixed media rendering", () => {
    test("renders both <img> and <video> when a story has mixed media types", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-img",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-img",
              order: 0,
              sourceUrl: "https://example.com/source.jpg",
              type: MediaType.Image,
              url: "https://example.com/image.jpg",
            },
            {
              id: "media-vid",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-vid",
              order: 1,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      expect(screen.getByRole("img", { name: /ai story/i })).toBeInTheDocument();
      expect(document.querySelector("video")).toBeInTheDocument();
    });

    test("renders image and video with correct srcs when both types are present", () => {
      mockStories = [
        makeStory({
          media: [
            {
              id: "media-img",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-img",
              order: 0,
              sourceUrl: "https://example.com/source.jpg",
              type: MediaType.Image,
              url: "https://example.com/image.jpg",
            },
            {
              id: "media-vid",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-vid",
              order: 1,
              sourceUrl: "https://example.com/poster.jpg",
              type: MediaType.Video,
              url: "https://example.com/video.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const img = screen.getByRole("img", { name: /ai story/i });
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg");

      const video = document.querySelector("video");
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
    });

    test("renders one video per story when multiple stories each have a video", () => {
      mockStories = [
        makeStory({
          id: "story-1",
          createdAt: "2024-01-15T10:00:00Z",
          media: [
            {
              id: "media-v1",
              aiArtifactId: "story-1",
              businessId: "biz-123",
              createdAt: new Date("2024-01-15"),
              jobId: "job-v1",
              order: 0,
              sourceUrl: "https://example.com/poster1.jpg",
              type: MediaType.Video,
              url: "https://example.com/video1.mp4",
            },
          ],
        }),
        makeStory({
          id: "story-2",
          createdAt: "2024-01-16T10:00:00Z",
          media: [
            {
              id: "media-v2",
              aiArtifactId: "story-2",
              businessId: "biz-123",
              createdAt: new Date("2024-01-16"),
              jobId: "job-v2",
              order: 0,
              sourceUrl: "https://example.com/poster2.jpg",
              type: MediaType.Video,
              url: "https://example.com/video2.mp4",
            },
          ],
        }),
      ];

      renderComponent();

      const videos = document.querySelectorAll("video");
      expect(videos).toHaveLength(2);
      // component sorts descending by createdAt: story-2 (Jan 16) first, story-1 (Jan 15) second
      expect(videos[0]).toHaveAttribute("src", "https://example.com/video2.mp4");
      expect(videos[1]).toHaveAttribute("src", "https://example.com/video1.mp4");
    });
  });
});
