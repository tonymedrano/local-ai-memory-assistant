import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runGraphOwnershipMigration } from "../../knowledge/graph/migrate-ownership.js";
import { GraphStorage } from "../../knowledge/graph/graph.storage.js";

const node = (id: string, label: string) => ({ id, label, type: "concept" as const, createdAt: "" });
const edge = (source: string, target: string) => ({ id: `${source}-${target}`, source, target, relation: "uses", confidence: 1, createdAt: "" });
test("explicit A/B mapping writes scoped v2 graph and reloads isolated", () => {
 const output = path.join(mkdtempSync(path.join(tmpdir(), "graph-migration-")), "knowledge-graph.json");
 const legacy: any = { nodes: [node("A1","apollo"),node("A2","database"),node("B1","apollo"),node("B2","database")], edges:[edge("A1","A2"),edge("B1","B2")] };
 const mapping: any = { version:1, nodes:{ A1:{kind:"tenant",tenantId:"tenant-a"},A2:{kind:"tenant",tenantId:"tenant-a"},B1:{kind:"tenant",tenantId:"tenant-b"},B2:{kind:"tenant",tenantId:"tenant-b"} } };
 assert.equal(runGraphOwnershipMigration(legacy,mapping,false,output).migratedNodes,4);
 const report=runGraphOwnershipMigration(legacy,mapping,true,output); assert.equal(report.unresolved,0);
 const beforeRerun=readFileSync(output,"utf8");
 assert.equal(runGraphOwnershipMigration(legacy,mapping,true,output).alreadyMigrated,true);
 assert.equal(readFileSync(output,"utf8"),beforeRerun);
 const disk=JSON.parse(readFileSync(output,"utf8")); assert.ok(disk.graphs["tenant:tenant-a"]); assert.ok(disk.graphs["tenant:tenant-b"]);
 const loaded=new GraphStorage(output).load(); assert.equal(loaded.nodes.filter((n:any)=>n.scope.tenantId==="tenant-a").length,2);
});
test("unresolved and cross-tenant edges fail closed without writing", () => {
 const output=path.join(mkdtempSync(path.join(tmpdir(),"graph-migration-")),"knowledge-graph.json");
 const legacy:any={nodes:[node("A","apollo"),node("B","database")],edges:[edge("A","B")]};
 assert.throws(()=>runGraphOwnershipMigration(legacy,{version:1,nodes:{A:{kind:"tenant",tenantId:"tenant-a"}}} as any,true,output));
 assert.throws(()=>runGraphOwnershipMigration(legacy,{version:1,nodes:{A:{kind:"tenant",tenantId:"tenant-a"},B:{kind:"tenant",tenantId:"tenant-b"}}} as any,true,output));
});

test("invalid tenant mapping and active v2 output both fail closed", () => {
 const output=path.join(mkdtempSync(path.join(tmpdir(),"graph-migration-")),"knowledge-graph.json"); const legacy:any={nodes:[node("A","apollo")],edges:[]};
 assert.throws(()=>runGraphOwnershipMigration(legacy,{version:1,nodes:{A:{kind:"tenant",tenantId:"bad tenant"}}} as any,true,output));
 assert.equal(existsSync(output),false);
 writeFileSync(output, JSON.stringify({schemaVersion:2,graphs:{"tenant:tenant-a":{scope:{kind:"tenant",tenantId:"tenant-a"},nodes:[],edges:[]}}})); const before=readFileSync(output,"utf8");
 assert.throws(()=>runGraphOwnershipMigration(legacy,{version:1,nodes:{A:{kind:"tenant",tenantId:"tenant-a"}}} as any,true,output)); assert.equal(readFileSync(output,"utf8"),before);
});

test("leaves the legacy quarantine untouched on successful and failed migration", () => {
 const dir=mkdtempSync(path.join(tmpdir(),"graph-migration-")); const output=path.join(dir,"knowledge-graph.json"); const quarantine=path.join(dir,"knowledge-graph.json.legacy-quarantine");
 const source={nodes:[node("A","apollo")],edges:[]}; writeFileSync(quarantine,JSON.stringify(source)); const before=readFileSync(quarantine,"utf8");
 runGraphOwnershipMigration(source as any,{version:1,nodes:{A:{kind:"tenant",tenantId:"tenant-a"}}},true,output);
 assert.equal(readFileSync(quarantine,"utf8"),before);
 assert.throws(()=>runGraphOwnershipMigration(source as any,{version:1,nodes:{A:{kind:"tenant",tenantId:"bad tenant"}}} as any,true,path.join(dir,"failed.json")));
 assert.equal(readFileSync(quarantine,"utf8"),before);
});
