import {
  newsFilterContextBlock,
  newsFilterArticlesBlock,
  type NewsFilterBusinessContext,
} from './news-relevance';
import {
  newsIdeasContextBlock,
  newsIdeasArticlesBlock,
  type NewsIdeasBusinessContext,
} from './news-ideas';

// ─────────────────────────────────────────────────────────────
// newsFilterContextBlock
// ─────────────────────────────────────────────────────────────
describe('newsFilterContextBlock', () => {
  const base: NewsFilterBusinessContext = {
    name: 'Acme Health',
    industry: 'Health',
    goals: ['increase revenue', 'grow audience'],
    advantages: ['fast delivery', 'certified quality'],
  };

  it('includes business name, industry, goals, and advantages', () => {
    const result = newsFilterContextBlock(base);

    expect(result).toContain('Acme Health');
    expect(result).toContain('Health');
    expect(result).toContain('increase revenue, grow audience');
    expect(result).toContain('fast delivery, certified quality');
  });

  it('omits Products / Services line when products are not provided', () => {
    const result = newsFilterContextBlock(base);

    expect(result).not.toContain('Products / Services');
  });

  it('omits Products / Services line when products array is empty', () => {
    const result = newsFilterContextBlock({ ...base, products: [] });

    expect(result).not.toContain('Products / Services');
  });

  it('includes product names and types when products are provided', () => {
    const result = newsFilterContextBlock({
      ...base,
      products: [
        { name: 'Supplement A', type: 'Physical' },
        { name: 'App B', type: 'Digital' },
      ],
    });

    expect(result).toContain('Products / Services');
    expect(result).toContain('Supplement A (Physical)');
    expect(result).toContain('App B (Digital)');
  });

  it('lists multiple products comma-separated on a single line', () => {
    const result = newsFilterContextBlock({
      ...base,
      products: [
        { name: 'Product X', type: 'Service' },
        { name: 'Product Y', type: 'Physical' },
      ],
    });

    expect(result).toContain('Product X (Service), Product Y (Physical)');
  });
});

// ─────────────────────────────────────────────────────────────
// newsFilterArticlesBlock
// ─────────────────────────────────────────────────────────────
describe('newsFilterArticlesBlock', () => {
  it('renders each article with its 0-based index, title, and summary', () => {
    const items = [
      {
        title: 'First article',
        summary: 'Summary one',
        url: 'u',
        source: 's',
        publishedAt: new Date(),
      },
      {
        title: 'Second article',
        summary: 'Summary two',
        url: 'u2',
        source: 's',
        publishedAt: new Date(),
      },
    ];

    const result = newsFilterArticlesBlock(items);

    expect(result).toContain('[0] Title: First article');
    expect(result).toContain('Summary: Summary one');
    expect(result).toContain('[1] Title: Second article');
    expect(result).toContain('Summary: Summary two');
  });

  it('renders N/A for articles with an empty summary', () => {
    const items = [
      {
        title: 'No summary article',
        summary: '',
        url: 'u',
        source: 's',
        publishedAt: new Date(),
      },
    ];

    const result = newsFilterArticlesBlock(items);

    expect(result).toContain('Summary: N/A');
  });
});

// ─────────────────────────────────────────────────────────────
// newsIdeasContextBlock
// ─────────────────────────────────────────────────────────────
describe('newsIdeasContextBlock', () => {
  const base: NewsIdeasBusinessContext = {
    name: 'Acme Health',
    industry: 'Health',
    goals: ['increase revenue'],
    advantages: ['fast delivery'],
  };

  it('includes business name, industry, goals, and advantages', () => {
    const result = newsIdeasContextBlock(base);

    expect(result).toContain('Acme Health');
    expect(result).toContain('Health');
    expect(result).toContain('increase revenue');
    expect(result).toContain('fast delivery');
  });

  it('omits Brand voice line when brand is not provided', () => {
    const result = newsIdeasContextBlock(base);

    expect(result).not.toContain('Brand voice');
  });

  it('includes brand voice when brand is provided', () => {
    const result = newsIdeasContextBlock({
      ...base,
      brand: 'Friendly and expert',
    });

    expect(result).toContain('Brand voice: Friendly and expert');
  });

  it('omits Products / Services section when products are not provided', () => {
    const result = newsIdeasContextBlock(base);

    expect(result).not.toContain('Products / Services');
  });

  it('omits Products / Services section when products array is empty', () => {
    const result = newsIdeasContextBlock({ ...base, products: [] });

    expect(result).not.toContain('Products / Services');
  });

  it('includes product name, type, and description for each product', () => {
    const result = newsIdeasContextBlock({
      ...base,
      products: [
        {
          name: 'Supplement A',
          type: 'Physical',
          description: 'Great supplement',
        },
        { name: 'App B', type: 'Digital', description: 'Mobile app' },
      ],
    });

    expect(result).toContain('Products / Services');
    expect(result).toContain('**Supplement A** (Physical): Great supplement');
    expect(result).toContain('**App B** (Digital): Mobile app');
  });

  it('omits Target Audience section when audiences are not provided', () => {
    const result = newsIdeasContextBlock(base);

    expect(result).not.toContain('Target Audience');
  });

  it('omits Target Audience section when audiences array is empty', () => {
    const result = newsIdeasContextBlock({ ...base, audiences: [] });

    expect(result).not.toContain('Target Audience');
  });

  it('includes audience name for each audience', () => {
    const result = newsIdeasContextBlock({
      ...base,
      audiences: [
        {
          name: 'Fitness Enthusiast',
          pains: ['lack of energy'],
          desires: ['feel stronger'],
          interests: ['gym', 'nutrition'],
        },
      ],
    });

    expect(result).toContain('Target Audience');
    expect(result).toContain('**Fitness Enthusiast**');
  });

  it('includes pains, desires, and interests for audiences that have them', () => {
    const result = newsIdeasContextBlock({
      ...base,
      audiences: [
        {
          name: 'Busy Parent',
          pains: ['no time', 'stress'],
          desires: ['quick meals', 'convenience'],
          interests: ['family health'],
        },
      ],
    });

    expect(result).toContain('Pains: no time, stress');
    expect(result).toContain('Desires: quick meals, convenience');
    expect(result).toContain('Interests: family health');
  });

  it('omits Pains line for an audience with empty pains array', () => {
    const result = newsIdeasContextBlock({
      ...base,
      audiences: [
        {
          name: 'Casual User',
          pains: [],
          desires: ['save money'],
          interests: ['deals'],
        },
      ],
    });

    expect(result).not.toContain('Pains:');
    expect(result).toContain('Desires: save money');
  });

  it('omits Desires line for an audience with empty desires array', () => {
    const result = newsIdeasContextBlock({
      ...base,
      audiences: [
        {
          name: 'Power User',
          pains: ['slow tools'],
          desires: [],
          interests: ['productivity'],
        },
      ],
    });

    expect(result).not.toContain('Desires:');
    expect(result).toContain('Pains: slow tools');
  });

  it('omits Interests line for an audience with empty interests array', () => {
    const result = newsIdeasContextBlock({
      ...base,
      audiences: [
        {
          name: 'New Customer',
          pains: ['high prices'],
          desires: ['better value'],
          interests: [],
        },
      ],
    });

    expect(result).not.toContain('Interests:');
    expect(result).toContain('Pains: high prices');
  });

  it('renders all optional sections together when full context is provided', () => {
    const result = newsIdeasContextBlock({
      ...base,
      brand: 'Bold and trusted',
      products: [
        { name: 'Product X', type: 'Service', description: 'A service' },
      ],
      audiences: [
        {
          name: 'Professional',
          pains: ['inefficiency'],
          desires: ['automation'],
          interests: ['tech'],
        },
      ],
    });

    expect(result).toContain('Brand voice: Bold and trusted');
    expect(result).toContain('Products / Services');
    expect(result).toContain('**Product X** (Service): A service');
    expect(result).toContain('Target Audience');
    expect(result).toContain('**Professional**');
    expect(result).toContain('Pains: inefficiency');
    expect(result).toContain('Desires: automation');
    expect(result).toContain('Interests: tech');
  });

  it('renders minimal output when only required fields are provided', () => {
    const result = newsIdeasContextBlock(base);

    expect(result).toContain('BUSINESS CONTEXT');
    expect(result).not.toContain('Brand voice');
    expect(result).not.toContain('Products / Services');
    expect(result).not.toContain('Target Audience');
  });
});

// ─────────────────────────────────────────────────────────────
// newsIdeasArticlesBlock
// ─────────────────────────────────────────────────────────────
describe('newsIdeasArticlesBlock', () => {
  it('renders each article with its 0-based index, title, and summary', () => {
    const result = newsIdeasArticlesBlock([
      { title: 'Article One', summary: 'Summary one' },
      { title: 'Article Two', summary: 'Summary two' },
    ]);

    expect(result).toContain('[0] Title: Article One');
    expect(result).toContain('Summary: Summary one');
    expect(result).toContain('[1] Title: Article Two');
    expect(result).toContain('Summary: Summary two');
  });

  it('renders N/A for articles with an empty summary', () => {
    const result = newsIdeasArticlesBlock([
      { title: 'No summary', summary: '' },
    ]);

    expect(result).toContain('Summary: N/A');
  });

  it('includes the NEWS ARTICLES header', () => {
    const result = newsIdeasArticlesBlock([
      { title: 'Any article', summary: 'Any summary' },
    ]);

    expect(result).toContain('## NEWS ARTICLES');
  });
});
