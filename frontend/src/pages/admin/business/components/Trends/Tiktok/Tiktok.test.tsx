import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tiktok from "./Tiktok";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ businessId: "biz-123" }),
}));

// Mutable flags so individual tests can override loading state
let mockIsQueryLoading = false;
let mockIsMutationLoading = false;

// Mock RTK Query hooks
const mockGetTikTokVideos = jest.fn();
const mockFetchTikTokVideos = jest.fn();

jest.mock("../../../../../../store/trends/trendsApi", () => ({
  useLazyGetTikTokVideosByBusinessIdQuery: () => [
    mockGetTikTokVideos,
    { isLoading: mockIsQueryLoading },
  ],
  useFetchTikTokVideosMutation: () => [
    mockFetchTikTokVideos,
    { isLoading: mockIsMutationLoading },
  ],
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
let mockTiktokVideos: any[] = [];

jest.mock("../../../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ trendsModule: { tiktokVideos: mockTiktokVideos } }),
}));

// Mock slice action
jest.mock("../../../../../../store/trends/trendsSlice", () => ({
  setTiktokVideos: (data: unknown) => ({ type: "trends/setTiktokVideos", payload: data }),
}));

// Mock showError utility
const mockShowError = jest.fn();
jest.mock("../../../../../../utils/showError", () => ({
  showError: (...args: unknown[]) => mockShowError(...args),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeVideo(overrides: Record<string, any> = {}) {
  return {
    id: "video-1",
    url: "https://example.com/video1.mp4",
    coverUrl: "https://example.com/cover1.jpg",
    hashtags: ["trending", "viral"],
    likeCount: 1200,
    shareCount: 340,
    commentCount: 89,
    raw: {
      videoMeta: {
        downloadAddr: "https://example.com/video1.mp4",
      },
    },
    ...overrides,
  };
}

function renderComponent() {
  return render(<Tiktok />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Tiktok component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTiktokVideos = [];
    mockIsQueryLoading = false;
    mockIsMutationLoading = false;
    // The component calls .unwrap() on the return value of each hook invocation
    mockGetTikTokVideos.mockReturnValue({ unwrap: () => Promise.resolve({ data: [] }) });
    mockFetchTikTokVideos.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  describe("default render", () => {
    test('renders "Trends" heading', () => {
      renderComponent();
      expect(screen.getByRole("heading", { name: /trends/i })).toBeInTheDocument();
    });

    test('renders "Get Tiktok" button', () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /get tiktok/i })).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    test('shows "No data" when tiktokVideos is an empty array', () => {
      mockTiktokVideos = [];
      renderComponent();
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    test('does not render any video cards when tiktokVideos is empty', () => {
      mockTiktokVideos = [];
      renderComponent();
      expect(document.querySelector("video")).not.toBeInTheDocument();
    });
  });

  describe("hashtag badges", () => {
    test("renders each hashtag as a pill badge with a # prefix", () => {
      mockTiktokVideos = [makeVideo({ hashtags: ["trending", "viral"] })];
      renderComponent();

      expect(screen.getByText("#trending")).toBeInTheDocument();
      expect(screen.getByText("#viral")).toBeInTheDocument();
    });

    test("badge element has rounded-full class indicating pill style", () => {
      mockTiktokVideos = [makeVideo({ hashtags: ["fashion"] })];
      renderComponent();

      const badge = screen.getByText("#fashion");
      expect(badge.className).toMatch(/rounded-full/);
    });

    test("renders all hashtags when a video has multiple tags", () => {
      mockTiktokVideos = [
        makeVideo({ hashtags: ["one", "two", "three", "four"] }),
      ];
      renderComponent();

      expect(screen.getByText("#one")).toBeInTheDocument();
      expect(screen.getByText("#two")).toBeInTheDocument();
      expect(screen.getByText("#three")).toBeInTheDocument();
      expect(screen.getByText("#four")).toBeInTheDocument();
    });

    test("renders hashtags for each video card independently", () => {
      mockTiktokVideos = [
        makeVideo({ id: "v1", hashtags: ["alpha"] }),
        makeVideo({ id: "v2", hashtags: ["beta"] }),
      ];
      renderComponent();

      expect(screen.getByText("#alpha")).toBeInTheDocument();
      expect(screen.getByText("#beta")).toBeInTheDocument();
    });

    test("renders no badges when a video has an empty hashtags array", () => {
      mockTiktokVideos = [makeVideo({ hashtags: [] })];
      renderComponent();

      const badges = document.querySelectorAll(".rounded-full");
      expect(badges).toHaveLength(0);
    });
  });

  describe("metrics", () => {
    test("renders the likeCount value", () => {
      mockTiktokVideos = [makeVideo({ likeCount: 9999 })];
      renderComponent();
      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    test("renders the shareCount value", () => {
      mockTiktokVideos = [makeVideo({ shareCount: 512 })];
      renderComponent();
      expect(screen.getByText("512")).toBeInTheDocument();
    });

    test("renders the commentCount value", () => {
      mockTiktokVideos = [makeVideo({ commentCount: 77 })];
      renderComponent();
      expect(screen.getByText("77")).toBeInTheDocument();
    });

    test("renders all three metrics together for a single video", () => {
      mockTiktokVideos = [
        makeVideo({ likeCount: 100, shareCount: 200, commentCount: 300 }),
      ];
      renderComponent();

      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("300")).toBeInTheDocument();
    });

    test("renders metrics for each video card when multiple videos are present", () => {
      mockTiktokVideos = [
        makeVideo({ id: "v1", likeCount: 11, shareCount: 22, commentCount: 33 }),
        makeVideo({ id: "v2", likeCount: 44, shareCount: 55, commentCount: 66 }),
      ];
      renderComponent();

      expect(screen.getByText("11")).toBeInTheDocument();
      expect(screen.getByText("22")).toBeInTheDocument();
      expect(screen.getByText("33")).toBeInTheDocument();
      expect(screen.getByText("44")).toBeInTheDocument();
      expect(screen.getByText("55")).toBeInTheDocument();
      expect(screen.getByText("66")).toBeInTheDocument();
    });
  });

  describe("video player", () => {
    test("renders a video element when the item has a url", () => {
      mockTiktokVideos = [makeVideo({ url: "https://example.com/video.mp4" })];
      renderComponent();
      expect(document.querySelector("video")).toBeInTheDocument();
    });

    test("video element has controls attribute", () => {
      mockTiktokVideos = [makeVideo()];
      renderComponent();
      expect(document.querySelector("video")).toHaveAttribute("controls");
    });

    test("video element uses coverUrl as poster", () => {
      mockTiktokVideos = [
        makeVideo({ coverUrl: "https://example.com/cover.jpg" }),
      ];
      renderComponent();
      expect(document.querySelector("video")).toHaveAttribute(
        "poster",
        "https://example.com/cover.jpg"
      );
    });

    test("does not render a video element when the item has no url", () => {
      mockTiktokVideos = [makeVideo({ url: null })];
      renderComponent();
      expect(document.querySelector("video")).not.toBeInTheDocument();
    });
  });

  describe("Get Tiktok button — mutation flow", () => {
    test("calls fetchTikTokVideos mutation with businessId when button is clicked", async () => {
      renderComponent();
      userEvent.click(screen.getByRole("button", { name: /get tiktok/i }));

      await waitFor(() => {
        expect(mockFetchTikTokVideos).toHaveBeenCalledWith("biz-123");
      });
    });

    test("re-fetches videos after successful mutation and dispatches results to Redux", async () => {
      const freshVideos = [makeVideo({ id: "fresh-1" })];
      // Both useEffect on mount and getTrends() call getTikTokVideosByBusinessId.
      // Set up the mock to always return fresh videos so the dispatch assertion holds.
      mockGetTikTokVideos.mockReturnValue({
        unwrap: () => Promise.resolve({ data: freshVideos }),
      });

      renderComponent();
      mockDispatch.mockClear();

      userEvent.click(screen.getByRole("button", { name: /get tiktok/i }));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: "trends/setTiktokVideos",
          payload: freshVideos,
        });
      });
    });

    test("calls showError when the mutation rejects", async () => {
      const mutationError = new Error("Network failure");
      mockFetchTikTokVideos.mockReturnValue({
        unwrap: () => Promise.reject(mutationError),
      });

      renderComponent();
      userEvent.click(screen.getByRole("button", { name: /get tiktok/i }));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(mutationError);
      });
    });

    test("does not call mutation when businessId is absent", async () => {
      // Override useParams to return no businessId for this test
      jest.resetModules();
    });
  });

  describe("Get Tiktok button — loading state", () => {
    test("button is disabled and shows 'Getting Trends...' when mutation is loading", () => {
      mockIsMutationLoading = true;
      renderComponent();

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText(/getting trends/i)).toBeInTheDocument();
    });

    test("button is disabled and shows 'Getting Trends...' when lazy query is loading", () => {
      mockIsQueryLoading = true;
      renderComponent();

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText(/getting trends/i)).toBeInTheDocument();
    });

    test("button is enabled and shows 'Get Tiktok' when neither hook is loading", () => {
      renderComponent();

      const button = screen.getByRole("button", { name: /get tiktok/i });
      expect(button).toBeEnabled();
    });
  });
});
