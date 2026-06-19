import { ContentPlanStatus } from './ContentPlanStatus';

describe('ContentPlanStatus enum', () => {
  it('has a Draft value equal to "Draft"', () => {
    expect(ContentPlanStatus.Draft).toBe('Draft');
  });

  it('has an Active value equal to "Active"', () => {
    expect(ContentPlanStatus.Active).toBe('Active');
  });

  it('has a Completed value equal to "Completed"', () => {
    expect(ContentPlanStatus.Completed).toBe('Completed');
  });

  it('has an Archived value equal to "Archived"', () => {
    expect(ContentPlanStatus.Archived).toBe('Archived');
  });

  it('contains exactly four members', () => {
    expect(Object.values(ContentPlanStatus)).toHaveLength(4);
  });

  it('all values are distinct', () => {
    const values = Object.values(ContentPlanStatus);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
