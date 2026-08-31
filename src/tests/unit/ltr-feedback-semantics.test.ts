import assert from "node:assert/strict";
import test from "node:test";

import { FeatureExtractor } from "../../ltr/features/feature.extractor.js";
import { FeedbackCollector } from "../../ltr/feedback/feedback.collector.js";
import type { FeedbackLearningService } from "../../ltr/feedback/feedback.learning.service.js";
import { FeedbackService } from "../../ltr/feedback/feedback.service.js";
import type { RankingFeedback } from "../../ltr/feedback/feedback.types.js";
import { FeedbackType } from "../../ltr/feedback/feedback.types.js";
import type { FeedbackRepository } from "../../ltr/feedback/feedback.repository.js";
import type { ModelRepository } from "../../ltr/model/model.repository.js";
import { TrainingService } from "../../ltr/training/training.service.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

type FeedbackInput = Omit<RankingFeedback, "id" | "createdAt" | "signal">;
type PersistedFeedbackInput = Omit<RankingFeedback, "id" | "createdAt">;

const features = {
  semantic: 0.8,
  bm25: 0.4,
  importance: 0.7,
  confidence: 0.9,
  freshness: 0.8,
  graphEvidence: 0.2,
  accessCount: 0.1,
  diversity: 0.5,
  duplicatePenalty: 0,
};

function retrievalResult(): RetrievalResult {
  return {
    memory: {
      id: "memory-1",
      text: "Feedback test memory",
      createdAt: new Date().toISOString(),
    },
    score: 0.8,
    semanticScore: 0.8,
    keywordScore: 0.4,
    source: "hybrid",
  };
}

function feedback(type: FeedbackType): RankingFeedback {
  return {
    id: crypto.randomUUID(),
    query: "feedback query",
    memoryId: "memory-1",
    type,
    signal: 0,
    features,
    createdAt: new Date(),
  };
}

test("returned results are recorded as impressions, not clicks", async () => {
  const records: Array<{ type: FeedbackType }> = [];
  const collector = new FeedbackCollector(
    {
      async record(input: FeedbackInput) {
        records.push({ type: input.type });
      },
    } as unknown as FeedbackLearningService,
    new FeatureExtractor(),
  );

  const result = retrievalResult();

  await collector.resultReturned("feedback query", [result]);
  collector.memorySelected("feedback query", result);
  collector.contextUsed("feedback query", result);
  collector.answerRejected("feedback query", result);

  assert.deepEqual(
    records.map((record) => record.type),
    [
      FeedbackType.IMPRESSION,
      FeedbackType.CLICK,
      FeedbackType.ACCEPT,
      FeedbackType.REJECT,
    ],
  );
});

test("assigns signals only to explicit feedback", () => {
  const records: Array<{ type: FeedbackType; signal: number }> = [];
  const service = new FeedbackService({
    save(input: PersistedFeedbackInput) {
      records.push({ type: input.type, signal: input.signal });
      return input as never;
    },
  } as unknown as FeedbackRepository);

  for (const type of [
    FeedbackType.IMPRESSION,
    FeedbackType.CLICK,
    FeedbackType.ACCEPT,
    FeedbackType.REJECT,
  ]) {
    service.record({
      query: "feedback query",
      memoryId: "memory-1",
      type,
      features,
    });
  }

  assert.deepEqual(records, [
    { type: FeedbackType.IMPRESSION, signal: 0 },
    { type: FeedbackType.CLICK, signal: 0.5 },
    { type: FeedbackType.ACCEPT, signal: 1 },
    { type: FeedbackType.REJECT, signal: -1 },
  ]);
});

test("offline training ignores non-trainable impressions", async () => {
  const savedModels: unknown[] = [];
  const feedbackRepository = {
    async findAll() {
      return Array.from({ length: 10 }, () => feedback(FeedbackType.IMPRESSION));
    },
  } as unknown as FeedbackRepository;
  const modelRepository = {
    load() {
      return null;
    },
    save(model: unknown) {
      savedModels.push(model);
    },
  } as unknown as ModelRepository;

  await new TrainingService(feedbackRepository, modelRepository).train();

  assert.equal(savedModels.length, 0);
});

test("offline training uses explicit feedback and excludes impressions", async () => {
  const savedModels: Array<{ samples: number }> = [];
  const feedbackRepository = {
    async findAll() {
      return [
        ...Array.from({ length: 10 }, () => feedback(FeedbackType.ACCEPT)),
        ...Array.from({ length: 10 }, () => feedback(FeedbackType.IMPRESSION)),
      ];
    },
  } as unknown as FeedbackRepository;
  const modelRepository = {
    load() {
      return null;
    },
    save(model: { samples: number }) {
      savedModels.push(model);
    },
  } as unknown as ModelRepository;

  await new TrainingService(feedbackRepository, modelRepository).train();

  assert.equal(savedModels.length, 1);
  assert.equal(savedModels[0]?.samples, 10);
});
