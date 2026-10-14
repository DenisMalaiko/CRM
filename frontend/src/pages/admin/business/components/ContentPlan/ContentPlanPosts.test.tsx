import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentPlanPosts } from './ContentPlanPosts';
import { TContentPlanPost } from '../../../../../models/ContentPlan';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ contentPlanId: 'test-id' }),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'ContentPlanPosts.Day': 'Day',
        'ContentPlanPosts.Hook': 'Hook',
        'ContentPlanPosts.CTA': 'CTA',
        'ContentPlanPosts.HideDetails': 'Hide Details',
        'ContentPlanPosts.ShowDetails': 'Show Details',
        'ContentPlanPosts.Title': 'Title',
        'ContentPlanPosts.Thesis': 'Thesis',
        'ContentPlanPosts.MarketingGoal': 'Marketing Goal',
        'ContentPlanPosts.ContentType': 'Content Type',
        'ContentPlanPosts.DesignReference': 'Design Reference',
        'ContentPlanPosts.BackButton': 'Back',
        'ContentPlanPosts.Title_page': 'Content Plan Posts',
        'ContentPlanPosts.Error': 'Failed to load posts.',
        'ContentPlanPosts.Empty': 'No posts found.',
      };
      return map[key] ?? key;
    },
  }),
}));

// mockQueryState holds mutable RTK Query return values. The object is captured by
// the mock factory closure at runtime (after hoisting), so per-test mutations
// are visible to the hook mock when the component renders.
const mockQueryState = {
  data: undefined as { data: TContentPlanPost[] } | undefined,
  isFetching: false,
  isError: false,
};

jest.mock('../../../../../store/contentPlan/contentPlanApi', () => ({
  useGetContentPlanPostsQuery: () => mockQueryState,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makePost(overrides: Partial<TContentPlanPost> = {}): TContentPlanPost {
  return {
    day: 1,
    date: '2024-01-15',
    funnelStage: 'TOFU',
    format: 'Carousel',
    contentType: 'Educational',
    topic: 'Test Topic',
    marketingGoal: 'Increase awareness',
    title: 'Post Title',
    hook: 'Grab their attention',
    thesis: 'Main argument here',
    cta: 'Learn more',
    designReference: 'Minimalist layout',
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ContentPlanPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryState.data = { data: [] };
    mockQueryState.isFetching = false;
    mockQueryState.isError = false;
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it('renders a loading spinner when isFetching is true', () => {
    mockQueryState.isFetching = true;
    mockQueryState.data = undefined;

    const { container } = render(<ContentPlanPosts />);

    // Spinner has no accessible role — identified by its animate-spin Tailwind class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── Page structure ─────────────────────────────────────────────────────────

  it('renders the page heading', () => {
    render(<ContentPlanPosts />);
    expect(screen.getByText('Content Plan Posts')).toBeInTheDocument();
  });

  it('renders the back button', () => {
    render(<ContentPlanPosts />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  // ── Posts rendering ────────────────────────────────────────────────────────

  it('renders post topic', () => {
    mockQueryState.data = { data: [makePost({ topic: 'My Topic' })] };

    render(<ContentPlanPosts />);

    expect(screen.getByText('My Topic')).toBeInTheDocument();
  });

  it('renders day and date for each post', () => {
    mockQueryState.data = { data: [makePost({ day: 3, date: '2024-02-20' })] };

    render(<ContentPlanPosts />);

    expect(screen.getByText(/Day 3/)).toBeInTheDocument();
    expect(screen.getByText(/2024-02-20/)).toBeInTheDocument();
  });

  it('renders hook and cta values for each post', () => {
    mockQueryState.data = {
      data: [makePost({ hook: 'Attention-grabbing hook', cta: 'Click here' })],
    };

    render(<ContentPlanPosts />);

    expect(screen.getByText('Attention-grabbing hook')).toBeInTheDocument();
    expect(screen.getByText('Click here')).toBeInTheDocument();
  });

  it('renders multiple post cards sorted by day ascending', () => {
    mockQueryState.data = {
      data: [
        makePost({ day: 3, topic: 'Topic C' }),
        makePost({ day: 1, topic: 'Topic A' }),
        makePost({ day: 2, topic: 'Topic B' }),
      ],
    };

    render(<ContentPlanPosts />);

    const topics = screen.getAllByText(/Topic [A-C]/);
    expect(topics).toHaveLength(3);
    expect(topics.map((el) => el.textContent)).toEqual(['Topic A', 'Topic B', 'Topic C']);
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it('shows empty state message when no posts are returned', () => {
    mockQueryState.data = { data: [] };

    render(<ContentPlanPosts />);

    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it('shows error message when the query is in error state', () => {
    mockQueryState.isFetching = false;
    mockQueryState.isError = true;

    render(<ContentPlanPosts />);

    expect(screen.getByText('Failed to load posts.')).toBeInTheDocument();
  });

  // ── Expand / collapse details ──────────────────────────────────────────────

  it('hides expanded details by default and shows "Show Details" button', () => {
    mockQueryState.data = { data: [makePost({ title: 'Detailed Title' })] };

    render(<ContentPlanPosts />);

    expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    // The post title lives inside the collapsed details section
    expect(screen.queryByText('Detailed Title')).not.toBeInTheDocument();
  });

  it('expands details section when "Show Details" is clicked', () => {
    mockQueryState.data = {
      data: [
        makePost({
          title: 'Expanded Post Title',
          thesis: 'Core thesis text',
          marketingGoal: 'Drive conversions',
          contentType: 'Blog post',
          designReference: 'Bold typography',
        }),
      ],
    };

    render(<ContentPlanPosts />);

    fireEvent.click(screen.getByRole('button', { name: /show details/i }));

    expect(screen.getByText('Expanded Post Title')).toBeInTheDocument();
    expect(screen.getByText('Core thesis text')).toBeInTheDocument();
    expect(screen.getByText('Drive conversions')).toBeInTheDocument();
    expect(screen.getByText('Blog post')).toBeInTheDocument();
    expect(screen.getByText('Bold typography')).toBeInTheDocument();
  });

  it('collapses details when "Hide Details" is clicked after expanding', () => {
    mockQueryState.data = { data: [makePost({ title: 'Collapsible Title' })] };

    render(<ContentPlanPosts />);

    fireEvent.click(screen.getByRole('button', { name: /show details/i }));
    expect(screen.getByText('Collapsible Title')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide details/i }));
    expect(screen.queryByText('Collapsible Title')).not.toBeInTheDocument();
  });

  // ── Back button ────────────────────────────────────────────────────────────

  it('calls navigate(-1) when the back button is clicked', () => {
    render(<ContentPlanPosts />);

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // ── Funnel stage badge colours ─────────────────────────────────────────────

  it('applies green badge classes to TOFU posts', () => {
    mockQueryState.data = { data: [makePost({ funnelStage: 'TOFU' })] };

    render(<ContentPlanPosts />);

    const badge = screen.getByText('TOFU');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-700');
  });

  it('applies amber badge classes to MOFU posts', () => {
    mockQueryState.data = { data: [makePost({ funnelStage: 'MOFU' })] };

    render(<ContentPlanPosts />);

    const badge = screen.getByText('MOFU');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-700');
  });

  it('applies blue badge classes to BOFU posts', () => {
    mockQueryState.data = { data: [makePost({ funnelStage: 'BOFU' })] };

    render(<ContentPlanPosts />);

    const badge = screen.getByText('BOFU');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-700');
  });

  // ── Format badge ───────────────────────────────────────────────────────────

  it('renders the format badge for each post', () => {
    mockQueryState.data = { data: [makePost({ format: 'Reels' })] };

    render(<ContentPlanPosts />);

    expect(screen.getByText('Reels')).toBeInTheDocument();
  });
});
