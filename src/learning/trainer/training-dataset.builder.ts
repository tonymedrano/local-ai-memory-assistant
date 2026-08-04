// src/learning/trainer/training-dataset.builder.ts

import { FeatureExtractor } from "../features/feature.extractor.js";
import type { TrainingExample } from "../features/feature.types.js";
import { FeedbackRepository } from "../feedback/feedback.repository.js";
import { MemoryRepository } from "../../memory/memory.repository.js";

export class TrainingDatasetBuilder {

    constructor(
        private readonly feedbackRepository: FeedbackRepository,
        private readonly memoryRepository: MemoryRepository,
        private readonly extractor: FeatureExtractor,
    ) {}

    async build(): Promise<TrainingExample[]> {

        const feedback =
            this.feedbackRepository.getAll();

        const dataset: TrainingExample[] = [];

        for (const record of feedback) {

            const memory =
                await this.memoryRepository.findById(
                    record.memoryId
                );

            if (!memory) {
                continue;
            }

            const extracted =
                this.extractor.extract({
                    memory,
                    score: 0,
                    source: "vector"
                });

            dataset.push({

                query:
                    record.query,

                memoryId:
                    memory.id!,

                features:
                    extracted.features,

                label:
                    record.label
            });
        }

        return dataset;
    }

}