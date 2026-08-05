import fs from "node:fs";
import path from "node:path";
import type { DatasetSample } from "./dataset.sample.js";

export class DatasetRepository {

    private readonly filePath = path.join(
        process.cwd(),
        "data",
        "ltr",
        "training-dataset.jsonl"
    );

    constructor() {
        this.ensureDirectory();
    }

    private ensureDirectory(): void {

        const dir = path.dirname(this.filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "");
        }
    }

    append(sample: DatasetSample): void {

        fs.appendFileSync(
            this.filePath,
            JSON.stringify(sample) + "\n",
            "utf8"
        );
    }

    findAll(): DatasetSample[] {

        if (!fs.existsSync(this.filePath)) {
            return [];
        }

        const lines = fs
            .readFileSync(this.filePath, "utf8")
            .split("\n")
            .filter(Boolean);

        return lines.map(line => {

            const sample = JSON.parse(line);

            return {
                ...sample,
                createdAt: new Date(sample.createdAt)
            };

        });

    }

    count(): number {
        return this.findAll().length;
    }

    clear(): void {
        fs.writeFileSync(this.filePath, "");
    }

    /**
     * Evita duplicados usando query+memoryId.
     * Si existe uno previo se sustituye por el nuevo.
     */
    upsert(sample: DatasetSample): void {

        const samples = this.findAll();

        const filtered = samples.filter(s =>
            !(
                s.query === sample.query &&
                s.memoryId === sample.memoryId
            )
        );

        filtered.push(sample);

        const content = filtered
            .map(s => JSON.stringify(s))
            .join("\n");

        fs.writeFileSync(
            this.filePath,
            content + (filtered.length ? "\n" : "")
        );
    }

}