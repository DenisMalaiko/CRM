import reducer, { setContentPlans } from './contentPlanSlice';
import { ContentPlanStatus } from '../../enum/ContentPlanStatus';
import { TContentPlan } from '../../models/ContentPlan';

const makePlan = (overrides: Partial<TContentPlan> = {}): TContentPlan => ({
  id: 'plan-1',
  businessId: 'biz-1',
  title: 'Q1 Plan',
  description: 'Description',
  status: ContentPlanStatus.Draft,
  mode: 'manual',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

describe('contentPlanSlice', () => {
  const initialState = { contentPlans: null };

  it('returns the initial state when called with undefined state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('setContentPlans sets an array of plans', () => {
    const plans = [makePlan()];
    const state = reducer(initialState, setContentPlans(plans));
    expect(state.contentPlans).toEqual(plans);
  });

  it('setContentPlans replaces existing plans with new ones', () => {
    const first = [makePlan({ id: 'plan-1' })];
    const second = [makePlan({ id: 'plan-2' }), makePlan({ id: 'plan-3' })];

    let state = reducer(initialState, setContentPlans(first));
    state = reducer(state, setContentPlans(second));

    expect(state.contentPlans).toHaveLength(2);
    expect(state.contentPlans![0].id).toBe('plan-2');
  });

  it('setContentPlans sets an empty array when given []', () => {
    const state = reducer({ contentPlans: [makePlan()] }, setContentPlans([]));
    expect(state.contentPlans).toEqual([]);
  });

  it('setContentPlans preserves all fields of each plan', () => {
    const plan = makePlan({
      id: 'plan-x',
      title: 'My Plan',
      status: ContentPlanStatus.Active,
      mode: 'profile',
    });
    const state = reducer(initialState, setContentPlans([plan]));
    expect(state.contentPlans![0]).toMatchObject({
      id: 'plan-x',
      title: 'My Plan',
      status: ContentPlanStatus.Active,
      mode: 'profile',
    });
  });
});
