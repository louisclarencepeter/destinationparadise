import assert from 'node:assert/strict';
import test from 'node:test';
import { MONTH_NAMES, normalizeMonth, planningContext, preferenceSummary, quoteValidation, type PlanningPreferences } from '../src/features/planner/planning-context';

const preferences: PlanningPreferences = { month: 'March', nights: 9, adults: 2, children: 0, budget: 'Mid-range', pace: 'Balanced', interests: ['Wildlife', 'Beach'], tripStyle: 'Safari + beach', destinationId: 'stone-town' };

test('all month handoffs normalize short and full names without inventing unknown months', () => {
  for (const month of MONTH_NAMES) {
    assert.equal(normalizeMonth(month), month);
    assert.equal(normalizeMonth(month.slice(0, 3).toUpperCase()), month);
  }
  assert.equal(normalizeMonth('soon'), undefined);
});

test('rainy month context uses the website guide and explicit overnight accounting', () => {
  for (const month of ['March', 'April', 'May', 'November']) {
    const context = planningContext({ ...preferences, month }, 'Stone Town');
    assert.match(context, /rainy \/ low hotel season/);
    assert.match(context, /9 nights means 10 days/);
    assert.match(context, /Count overnight stays explicitly/);
    assert.match(context, /Dates\/year unconfirmed/);
    assert.match(context, /no invented exact dates, confirmed prices, availability or bookings/);
  }
});

test('new month and destination supersede previous handoff context', () => {
  const context = planningContext({ ...preferences, month: 'December', nights: 12, destinationId: 'serengeti' }, 'Serengeti');
  assert.match(context, /December; 12 nights/);
  assert.match(context, /Around: Serengeti/);
  assert.match(context, /12 nights means 13 days/);
  assert.match(context, /high or peak hotel season; weather is not guaranteed/);
  assert.doesNotMatch(context, /March|Stone Town/);
  assert.ok(context.length < 900, 'leave room for a user message in the 1,200-character API limit');
});

test('summary displays the selected month, guest counts and destination consistently', () => {
  assert.equal(preferenceSummary({ ...preferences, month: 'Sep', children: 1 }, 'Stone Town'), '9 nights in September · 2 adults + 1 child · Stone Town');
});

test('quote validation requires a valid name, email and explicit sharing consent', () => {
  assert.ok(quoteValidation({ name: '', email: 'qa@example.com', phone: '' }, true));
  assert.ok(quoteValidation({ name: 'Synthetic Guest', email: 'invalid', phone: '' }, true));
  assert.ok(quoteValidation({ name: 'Synthetic Guest', email: 'qa@example.com', phone: '' }, false));
  assert.equal(quoteValidation({ name: 'Synthetic Guest', email: 'qa@example.com', phone: '' }, true), null);
});
