import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiPhoto } from "./AiPhoto";
import { TGalleryPhoto } from "../../../../../models/Gallery";
import { GalleryType } from "../../../../../enum/GalleryType";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ businessId: "test-123" }),
}));

// Mock RTK Query hooks
const mockGetPhotos = jest.fn();
const mockDeletePhoto = jest.fn();

jest.mock("../../../../../store/gallery/galleryApi", () => ({
  useLazyGetAiPhotosQuery: () => [mockGetPhotos],
  useDeletePhotoMutation: () => [mockDeletePhoto],
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
let mockAiPhotos: TGalleryPhoto[] = [];
jest.mock("../../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ galleryModule: { aiPhotos: mockAiPhotos } }),
}));

// Mock gallerySlice action
jest.mock("../../../../../store/gallery/gallerySlice", () => ({
  setAiPhotosGalleryPhotos: (data: unknown) => ({ type: "gallery/setAiPhotos", payload: data }),
}));

// Mock ConfirmDlg
jest.mock("../../../../../components/confirmDlg/ConfirmDlg", () => ({
  confirm: jest.fn(),
}));

// Mock SliderDlg
jest.mock("../../../../../components/sliderDlg/SliderDlg", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="slider-dlg" /> : null,
}));

// Mock CreateAiPhotoDlg
jest.mock("./components/CreateAiPhotoDlg", () => ({
  CreateAiPhotoDlg: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="create-ai-photo-dlg">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock showError utility
jest.mock("../../../../../utils/showError", () => ({
  showError: jest.fn(),
}));

const mockPhotos: TGalleryPhoto[] = [
  {
    id: "photo-1",
    businessId: "test-123",
    url: "https://example.com/photo1.jpg",
    description: "a sunset over the ocean",
    type: GalleryType.AI,
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "photo-2",
    businessId: "test-123",
    url: "https://example.com/photo2.jpg",
    description: "a mountain landscape",
    type: GalleryType.AI,
    isActive: true,
    createdAt: new Date("2024-01-16"),
  },
];

function renderComponent() {
  return render(<AiPhoto />);
}

describe("AiPhoto component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAiPhotos = [];
    mockGetPhotos.mockResolvedValue({ data: { data: [] } });
  });

  describe("default render", () => {
    test('renders "AI Photo" heading', () => {
      renderComponent();
      expect(screen.getByRole("heading", { name: /ai photo/i })).toBeInTheDocument();
    });

    test('renders "Generate" button in header', () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    test("shows empty state message when aiPhotos is empty", () => {
      mockAiPhotos = [];
      renderComponent();
      expect(screen.getByText(/no photos generated yet/i)).toBeInTheDocument();
    });
  });

  describe("photo grid", () => {
    test("renders photo images when aiPhotos has items", () => {
      mockAiPhotos = mockPhotos;
      renderComponent();
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(mockPhotos.length);
    });

    test("each photo image has correct src", () => {
      mockAiPhotos = mockPhotos;
      renderComponent();
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", mockPhotos[0].url);
      expect(images[1]).toHaveAttribute("src", mockPhotos[1].url);
    });

    test("does not show empty state message when photos exist", () => {
      mockAiPhotos = mockPhotos;
      renderComponent();
      expect(screen.queryByText(/no photos generated yet/i)).not.toBeInTheDocument();
    });
  });

  describe("generate dialog", () => {
    test('clicking "Generate" button opens CreateAiPhotoDlg', async () => {
      renderComponent();

      expect(screen.queryByTestId("create-ai-photo-dlg")).not.toBeInTheDocument();

      userEvent.click(screen.getByRole("button", { name: /generate/i }));

      expect(screen.getByTestId("create-ai-photo-dlg")).toBeInTheDocument();
    });

    test("dialog closes when onClose is called", async () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /generate/i }));
      expect(screen.getByTestId("create-ai-photo-dlg")).toBeInTheDocument();

      userEvent.click(screen.getByRole("button", { name: /close dialog/i }));

      await waitFor(() => {
        expect(screen.queryByTestId("create-ai-photo-dlg")).not.toBeInTheDocument();
      });
    });
  });

  describe("slider dialog", () => {
    test("slider is not visible by default", () => {
      renderComponent();
      expect(screen.queryByTestId("slider-dlg")).not.toBeInTheDocument();
    });
  });
});
