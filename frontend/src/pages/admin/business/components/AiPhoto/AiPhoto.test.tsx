import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiPhoto } from "./AiPhoto";
import { TAiPhoto } from "../../../../../models/AiPhoto";

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ businessId: "test-123" }),
  useNavigate: () => mockNavigate,
}));

// Mock RTK Query hooks
const mockGeneratePhoto = jest.fn();
const mockGetPhotos = jest.fn();
const mockDeletePhoto = jest.fn();

jest.mock("../../../../../store/ai/photo/photoAiApi", () => ({
  useGeneratePhotoAIMutation: () => [mockGeneratePhoto, { isLoading: false }],
  useLazyGetPhotosAIQuery: () => [mockGetPhotos],
  useDeletePhotoAIMutation: () => [mockDeletePhoto],
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
let mockPhotosAi: TAiPhoto[] | null = null;
jest.mock("../../../../../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ photoAiModule: { photosAi: mockPhotosAi } }),
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

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock showError utility
jest.mock("../../../../../utils/showError", () => ({
  showError: jest.fn(),
}));

const mockPhotos: TAiPhoto[] = [
  {
    id: "photo-1",
    businessId: "test-123",
    url: "https://example.com/photo1.jpg",
    prompt: "a sunset over the ocean",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "photo-2",
    businessId: "test-123",
    url: "https://example.com/photo2.jpg",
    prompt: "a mountain landscape",
    createdAt: new Date("2024-01-16"),
  },
];

function renderComponent() {
  return render(<AiPhoto />);
}

describe("AiPhoto component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPhotosAi = null;
    mockGetPhotos.mockResolvedValue({ data: { data: [] } });
  });

  describe("default render", () => {
    test('renders "AI Photo" heading', () => {
      renderComponent();
      expect(screen.getByRole("heading", { name: /ai photo/i })).toBeInTheDocument();
    });

    test('renders "Generate" button in header', () => {
      renderComponent();
      // The header Generate button — use getAllByRole since dialog also has one
      const buttons = screen.getAllByRole("button", { name: /generate/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("empty state", () => {
    test("shows empty state message when photosAi is null", () => {
      mockPhotosAi = null;
      renderComponent();
      expect(screen.getByText(/no photos generated yet/i)).toBeInTheDocument();
    });

    test("shows empty state message when photosAi is an empty array", () => {
      mockPhotosAi = [];
      renderComponent();
      expect(screen.getByText(/no photos generated yet/i)).toBeInTheDocument();
    });
  });

  describe("photo grid", () => {
    test("renders photo images when photosAi has items", () => {
      mockPhotosAi = mockPhotos;
      renderComponent();
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(mockPhotos.length);
    });

    test("each photo image has correct src", () => {
      mockPhotosAi = mockPhotos;
      renderComponent();
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", mockPhotos[0].url);
      expect(images[1]).toHaveAttribute("src", mockPhotos[1].url);
    });

    test("does not show empty state message when photos exist", () => {
      mockPhotosAi = mockPhotos;
      renderComponent();
      expect(screen.queryByText(/no photos generated yet/i)).not.toBeInTheDocument();
    });
  });

  describe("generate dialog", () => {
    test('clicking "Generate" button opens the dialog', async () => {
      renderComponent();

      // Dialog should not be visible initially
      expect(screen.queryByText(/generate ai photo/i)).not.toBeInTheDocument();

      const generateButton = screen.getByRole("button", { name: /^generate$/i });
      userEvent.click(generateButton);

      expect(screen.getByText(/generate ai photo/i)).toBeInTheDocument();
    });

    test("dialog contains a textarea", () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));

      expect(
        screen.getByPlaceholderText(/describe the photo you want to generate/i)
      ).toBeInTheDocument();
    });

    test('dialog contains a "Generate" button', () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));

      // Dialog has its own Generate button
      const dialogGenerateButtons = screen.getAllByRole("button", { name: /generate/i });
      expect(dialogGenerateButtons.length).toBeGreaterThanOrEqual(1);
    });

    test("Generate button in dialog is disabled when textarea is empty", () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));

      const textarea = screen.getByPlaceholderText(/describe the photo you want to generate/i);
      expect(textarea).toHaveValue("");

      // The dialog's Generate button — last one in DOM (dialog appended after header button)
      const generateButtons = screen.getAllByRole("button", { name: /^generate$/i });
      const dialogGenerateBtn = generateButtons[generateButtons.length - 1];
      expect(dialogGenerateBtn).toBeDisabled();
    });

    test("Generate button in dialog is enabled when textarea has text", () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));

      const textarea = screen.getByPlaceholderText(/describe the photo you want to generate/i);
      userEvent.type(textarea, "a beautiful sunset");

      const generateButtons = screen.getAllByRole("button", { name: /^generate$/i });
      const dialogGenerateBtn = generateButtons[generateButtons.length - 1];
      expect(dialogGenerateBtn).not.toBeDisabled();
    });

    test("Generate button is disabled when textarea contains only whitespace", () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));

      const textarea = screen.getByPlaceholderText(/describe the photo you want to generate/i);
      userEvent.type(textarea, "   ");

      const generateButtons = screen.getAllByRole("button", { name: /^generate$/i });
      const dialogGenerateBtn = generateButtons[generateButtons.length - 1];
      expect(dialogGenerateBtn).toBeDisabled();
    });

    test("dialog closes when X button is clicked", async () => {
      renderComponent();

      userEvent.click(screen.getByRole("button", { name: /^generate$/i }));
      expect(screen.getByText(/generate ai photo/i)).toBeInTheDocument();

      // Close via X button (has lucide X icon, no text label — find by its unique context)
      const closeButton = screen.getByRole("button", { name: "" });
      userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/generate ai photo/i)).not.toBeInTheDocument();
      });
    });
  });
});
